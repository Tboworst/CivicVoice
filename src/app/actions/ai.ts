"use server";

import {
  callOpenRouter,
  hasOpenRouterConfig,
  parseJsonSafely,
  OpenRouterError,
} from "@/lib/openrouter";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────

export interface AIResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: "NO_KEY" | "MALFORMED" | "SERVICE" | "TIMEOUT";
}

function wrapError(err: unknown): Pick<AIResult<never>, "error" | "errorCode"> {
  if (err instanceof OpenRouterError) {
    return { error: err.message, errorCode: err.code };
  }
  return { error: "An unexpected AI error occurred.", errorCode: "SERVICE" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) { return supabase; }

// ─────────────────────────────────────────────
// FEATURE 1: ISSUE CATEGORIZATION
// ─────────────────────────────────────────────

export interface IssueCategorization {
  category: string;
  tags: string[];
  summary: string;
  mainConcern: string;
  suggestedStakeholder: string;
  confidence: number; // 0–1
}

const VALID_CATEGORIES = [
  "infrastructure", "safety", "environment", "transportation",
  "housing", "education", "health", "technology", "community", "other",
];

export async function categorizeIssue(
  title: string,
  description: string
): Promise<AIResult<IssueCategorization>> {
  if (!hasOpenRouterConfig()) {
    return { success: false, error: "AI categorization requires an OpenRouter API key.", errorCode: "NO_KEY" };
  }

  try {
    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are an AI assistant for CivicVoice, a civic engagement platform for Towson, Maryland. " +
            "Analyze the submitted community issue and return valid JSON only — no markdown, no explanation.",
        },
        {
          role: "user",
          content:
            `Analyze this community issue:\n\nTitle: ${title}\nDescription: ${description}\n\n` +
            `Return exactly this JSON:\n` +
            `{\n` +
            `  "category": "one of: infrastructure|safety|environment|transportation|housing|education|health|technology|community|other",\n` +
            `  "tags": ["3", "to", "5", "lowercase", "tags"],\n` +
            `  "summary": "one sentence max 100 chars",\n` +
            `  "mainConcern": "core underlying problem in 10-15 words",\n` +
            `  "suggestedStakeholder": "most relevant institution or department",\n` +
            `  "confidence": 0.85\n` +
            `}`,
        },
      ],
      { jsonMode: true, temperature: 0.2, maxTokens: 512 }
    );

    const parsed = parseJsonSafely<IssueCategorization>(raw);
    if (!VALID_CATEGORIES.includes(parsed.category)) parsed.category = "other";
    parsed.confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5));
    if (!Array.isArray(parsed.tags)) parsed.tags = [];
    parsed.tags = parsed.tags.filter((t) => typeof t === "string").slice(0, 6);

    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, ...wrapError(err) };
  }
}

// ─────────────────────────────────────────────
// FEATURE 2: RELATED ISSUE DETECTION
// ─────────────────────────────────────────────

export interface RelatedIssueResult {
  issueId: string;
  title: string;
  similarityReason: string;
  similarityScore: number;
  isGeographicallyClose: boolean;
}

export async function findRelatedIssues(
  targetId: string,
  targetTitle: string,
  targetDescription: string,
  targetLocation: string,
  targetCategory: string
): Promise<AIResult<RelatedIssueResult[]>> {
  if (!hasOpenRouterConfig()) {
    return { success: false, error: "AI features require an OpenRouter API key.", errorCode: "NO_KEY" };
  }

  type Candidate = { id: string; title: string; description: string; location: string; category: string };
  let candidates: Candidate[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await db(supabase)
      .from("issues")
      .select("id, title, description, location_name, category")
      .neq("id", targetId)
      .order("created_at", { ascending: false })
      .limit(30) as { data: { id: string; title: string; description: string; location_name: string; category: string }[] | null };

    candidates = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description.slice(0, 300),
      location: r.location_name,
      category: r.category,
    }));
  } else {
    candidates = DEMO_ISSUES
      .filter((i) => i.id !== targetId)
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description.slice(0, 300),
        location: i.location.name,
        category: i.category,
      }));
  }

  if (candidates.length === 0) return { success: true, data: [] };

  try {
    const issueList = candidates
      .map((c, i) =>
        `${i + 1}. ID: ${c.id}\n   Title: ${c.title}\n   Category: ${c.category}\n   Location: ${c.location}\n   Description: ${c.description}`
      )
      .join("\n\n");

    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are an AI for CivicVoice, a civic platform in Towson, MD. " +
            "Find community issues that describe similar problems. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            `Target issue:\nTitle: ${targetTitle}\nCategory: ${targetCategory}\nLocation: ${targetLocation}\nDescription: ${targetDescription}\n\n` +
            `Compare against:\n${issueList}\n\n` +
            `Return a JSON array of up to 3 most related issues (similarity >= 0.4 only):\n` +
            `[{ "issueId": "exact id", "title": "exact title", "similarityReason": "1-2 sentence explanation", "similarityScore": 0.0, "isGeographicallyClose": false }]\n` +
            `Return [] if no issues are sufficiently related.`,
        },
      ],
      { jsonMode: true, temperature: 0.2, maxTokens: 768 }
    );

    const parsed = parseJsonSafely<RelatedIssueResult[]>(raw);
    if (!Array.isArray(parsed)) return { success: true, data: [] };

    const validated = parsed
      .filter((r) => typeof r.issueId === "string" && r.issueId.length > 0)
      .map((r) => ({
        ...r,
        similarityScore: Math.min(1, Math.max(0, Number(r.similarityScore) || 0)),
        isGeographicallyClose: Boolean(r.isGeographicallyClose),
      }))
      .filter((r) => r.similarityScore >= 0.4)
      .slice(0, 3);

    return { success: true, data: validated };
  } catch (err) {
    return { success: false, ...wrapError(err) };
  }
}

// ─────────────────────────────────────────────
// FEATURE 3: COMMUNITY INSIGHTS
// ─────────────────────────────────────────────

export interface CommunityInsightsStats {
  totalIssues: number;
  topCategory: string;
  avgVotesPerIssue: number;
  resolvedCount: number;
  geographicHotspots: { area: string; count: number }[];
}

export interface CommunityInsightsAI {
  recurringProblems: string[];
  commonThemes: string[];
  proposedSolutions: string[];
  emergingConcerns: string[];
  geographicPatterns: string[];
}

export interface CommunityInsights {
  stats: CommunityInsightsStats;
  aiInsights: CommunityInsightsAI;
  generatedAt: string;
}

export async function generateCommunityInsights(): Promise<AIResult<CommunityInsights>> {
  if (!hasOpenRouterConfig()) {
    return { success: false, error: "AI features require an OpenRouter API key.", errorCode: "NO_KEY" };
  }

  type IssueEntry = { id: string; title: string; description: string; category: string; status: string; votes: number; location: string };
  let issues: IssueEntry[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await db(supabase)
      .from("issues")
      .select("id, title, description, category, status, vote_count, location_name, location_area")
      .order("created_at", { ascending: false })
      .limit(50) as { data: { id: string; title: string; description: string; category: string; status: string; vote_count: number; location_name: string; location_area: string | null }[] | null };

    issues = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description.slice(0, 200),
      category: r.category,
      status: r.status,
      votes: r.vote_count,
      location: r.location_area || r.location_name,
    }));
  } else {
    issues = DEMO_ISSUES.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description.slice(0, 200),
      category: i.category,
      status: i.status,
      votes: i.votes,
      location: i.location.area || i.location.name,
    }));
  }

  // Calculated statistics (no AI needed)
  const categoryCount: Record<string, number> = {};
  const areaCount: Record<string, number> = {};
  let totalVotes = 0;
  let resolvedCount = 0;

  for (const issue of issues) {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
    if (issue.location) areaCount[issue.location] = (areaCount[issue.location] || 0) + 1;
    totalVotes += issue.votes;
    if (issue.status === "resolved") resolvedCount++;
  }

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other";
  const geographicHotspots = Object.entries(areaCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area, count]) => ({ area, count }));

  const stats: CommunityInsightsStats = {
    totalIssues: issues.length,
    topCategory,
    avgVotesPerIssue: issues.length > 0 ? Math.round(totalVotes / issues.length) : 0,
    resolvedCount,
    geographicHotspots,
  };

  // AI interpretations
  try {
    const issueList = issues
      .map((i) => `- [${i.category}] "${i.title}" (${i.votes} votes, ${i.status}) @ ${i.location}`)
      .join("\n");

    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a civic data analyst for CivicVoice in Towson, Maryland. " +
            "Analyze community issue submissions and identify patterns. Be objective and specific. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            `Analyze these ${issues.length} community issues:\n\n${issueList}\n\n` +
            `Return exactly this JSON (3-5 items per array):\n` +
            `{\n` +
            `  "recurringProblems": ["specific repeating issue types"],\n` +
            `  "commonThemes": ["broader themes connecting multiple issues"],\n` +
            `  "proposedSolutions": ["types of solutions that could address multiple issues"],\n` +
            `  "emergingConcerns": ["issues gaining momentum or underrepresented"],\n` +
            `  "geographicPatterns": ["geographic clustering or patterns you observe"]\n` +
            `}`,
        },
      ],
      { jsonMode: true, temperature: 0.4, maxTokens: 1024 }
    );

    const aiInsights = parseJsonSafely<CommunityInsightsAI>(raw);
    const ensureStrings = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

    return {
      success: true,
      data: {
        stats,
        aiInsights: {
          recurringProblems: ensureStrings(aiInsights.recurringProblems),
          commonThemes: ensureStrings(aiInsights.commonThemes),
          proposedSolutions: ensureStrings(aiInsights.proposedSolutions),
          emergingConcerns: ensureStrings(aiInsights.emergingConcerns),
          geographicPatterns: ensureStrings(aiInsights.geographicPatterns),
        },
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return { success: false, ...wrapError(err) };
  }
}

// ─────────────────────────────────────────────
// FEATURE 4: PROPOSAL GENERATION
// ─────────────────────────────────────────────

export interface ProposalDraft {
  title: string;
  problemStatement: string;
  proposedSolution: string;
  relevantStakeholder: string;
  recommendedNextStep: string;
  supportingIssueIds: string[];
  supportingIssueTitles: string[];
}

export async function generateProposal(issueIds: string[]): Promise<AIResult<ProposalDraft>> {
  if (!hasOpenRouterConfig()) {
    return { success: false, error: "AI features require an OpenRouter API key.", errorCode: "NO_KEY" };
  }
  if (issueIds.length === 0) {
    return { success: false, error: "Select at least one issue to generate a proposal." };
  }

  type IssueEntry = { id: string; title: string; description: string; category: string; votes: number; location: string };
  let issues: IssueEntry[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await db(supabase)
      .from("issues")
      .select("id, title, description, category, vote_count, location_name")
      .in("id", issueIds) as { data: { id: string; title: string; description: string; category: string; vote_count: number; location_name: string }[] | null };

    issues = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      votes: r.vote_count,
      location: r.location_name,
    }));
  } else {
    issues = DEMO_ISSUES
      .filter((i) => issueIds.includes(i.id))
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        votes: i.votes,
        location: i.location.name,
      }));
  }

  if (issues.length === 0) {
    return { success: false, error: "Could not find the selected issues." };
  }

  try {
    const issueList = issues
      .map(
        (i, n) =>
          `Issue ${n + 1}:\nTitle: ${i.title}\nCategory: ${i.category}\nLocation: ${i.location}\nVotes: ${i.votes}\nDescription: ${i.description}`
      )
      .join("\n\n---\n\n");

    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a civic policy analyst for CivicVoice in Towson, Maryland. " +
            "Generate actionable community proposals based on submitted issues. " +
            "Be specific, neutral, and realistic. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            `Generate a community proposal addressing these issues:\n\n${issueList}\n\n` +
            `Return exactly this JSON:\n` +
            `{\n` +
            `  "title": "Concise proposal title (max 80 chars)",\n` +
            `  "problemStatement": "Clear 2-3 sentence problem statement",\n` +
            `  "proposedSolution": "Specific, actionable solution (3-4 sentences)",\n` +
            `  "relevantStakeholder": "Name of the most appropriate institution or body",\n` +
            `  "recommendedNextStep": "Single most important immediate action (1-2 sentences)"\n` +
            `}`,
        },
      ],
      { jsonMode: true, temperature: 0.5, maxTokens: 1024 }
    );

    const parsed = parseJsonSafely<Omit<ProposalDraft, "supportingIssueIds" | "supportingIssueTitles">>(raw);

    return {
      success: true,
      data: {
        ...parsed,
        supportingIssueIds: issues.map((i) => i.id),
        supportingIssueTitles: issues.map((i) => i.title),
      },
    };
  } catch (err) {
    return { success: false, ...wrapError(err) };
  }
}

export async function saveGeneratedProposal(
  draft: ProposalDraft
): Promise<AIResult<{ id: string }>> {
  if (!hasSupabaseConfig()) {
    // Demo mode: just return a fake ID
    return { success: true, data: { id: "demo-" + Date.now() } };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await db(supabase)
    .from("proposals")
    .insert({
      title: draft.title,
      description:
        `${draft.problemStatement}\n\n${draft.proposedSolution}\n\nRecommended next step: ${draft.recommendedNextStep}`,
      related_issue_ids: draft.supportingIssueIds,
      estimated_impact: draft.relevantStakeholder,
      status: "proposed",
      is_ai_generated: true,
      proposer_id: user?.id ?? null,
    })
    .select("id")
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { success: false, error: error.message };

  revalidatePath("/proposals");
  revalidatePath("/admin");
  return { success: true, data: { id: data!.id } };
}

// ─────────────────────────────────────────────
// FEATURE 5: PRIORITY ANALYSIS
// ─────────────────────────────────────────────

export interface PrioritySignals {
  votes: number;
  relatedCount: number;
  recencyScore: number;   // 0–100
  severityScore: number;  // 0–100
}

export interface PriorityScore {
  issueId: string;
  title: string;
  category: string;
  location: string;
  totalScore: number; // 0–100
  signals: PrioritySignals;
  aiInterpretation: string;
}

export interface PriorityAnalysis {
  scores: PriorityScore[];
  methodology: {
    voteWeight: number;
    relatedWeight: number;
    recencyWeight: number;
    severityWeight: number;
  };
  generatedAt: string;
}

function recencyScore(submittedAt: string): number {
  const ageMs = Date.now() - new Date(submittedAt).getTime();
  const ageDays = ageMs / 86_400_000;
  return Math.max(0, Math.min(100, Math.round(100 - ageDays * 0.9)));
}

function severityScore(status: string, votes: number): number {
  const base = ({ open: 50, under_review: 60, in_progress: 70, resolved: 20 } as Record<string, number>)[status] ?? 50;
  return Math.min(100, Math.round(base + Math.min(30, votes / 10)));
}

export async function calculatePriorities(): Promise<AIResult<PriorityAnalysis>> {
  if (!hasOpenRouterConfig()) {
    return { success: false, error: "AI features require an OpenRouter API key.", errorCode: "NO_KEY" };
  }

  const W = { votes: 0.40, related: 0.20, recency: 0.25, severity: 0.15 };

  type IssueEntry = { id: string; title: string; category: string; status: string; votes: number; submittedAt: string; location: string };
  let issues: IssueEntry[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await db(supabase)
      .from("issues")
      .select("id, title, category, status, vote_count, created_at, location_area, location_name")
      .order("vote_count", { ascending: false })
      .limit(20) as { data: { id: string; title: string; category: string; status: string; vote_count: number; created_at: string; location_area: string | null; location_name: string }[] | null };

    issues = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      votes: r.vote_count,
      submittedAt: r.created_at,
      location: r.location_area || r.location_name,
    }));
  } else {
    issues = DEMO_ISSUES.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      status: i.status,
      votes: i.votes,
      submittedAt: i.submittedAt,
      location: i.location.area || i.location.name,
    }));
  }

  const maxVotes = Math.max(1, ...issues.map((i) => i.votes));

  const scored: PriorityScore[] = issues
    .map((issue) => {
      const voteScore = (issue.votes / maxVotes) * 100;
      const relScore = 0; // could query related issues; kept at 0 without extra DB call
      const recScore = recencyScore(issue.submittedAt);
      const sevScore = severityScore(issue.status, issue.votes);
      const total = Math.round(
        voteScore * W.votes + relScore * W.related + recScore * W.recency + sevScore * W.severity
      );
      return {
        issueId: issue.id,
        title: issue.title,
        category: issue.category,
        location: issue.location,
        totalScore: total,
        signals: { votes: issue.votes, relatedCount: 0, recencyScore: recScore, severityScore: sevScore },
        aiInterpretation: "",
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);

  // AI interpretations (optional — scores are valid even if this fails)
  try {
    const list = scored
      .map(
        (s, i) =>
          `${i + 1}. "${s.title}" — Score: ${s.totalScore}/100 (votes: ${s.signals.votes}, recency: ${s.signals.recencyScore}, severity: ${s.signals.severityScore})`
      )
      .join("\n");

    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a civic data analyst. Add brief neutral interpretations to community priority scores. " +
            "Do NOT change the rankings. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            `These issues are ranked by calculated priority score (votes 40%, recency 25%, severity 15%, related 20%):\n\n${list}\n\n` +
            `Return a JSON array — one entry per issue (max 20 words each):\n` +
            `[{ "rank": 1, "interpretation": "brief neutral explanation" }, ...]`,
        },
      ],
      { jsonMode: true, temperature: 0.3, maxTokens: 768 }
    );

    const interps = parseJsonSafely<{ rank: number; interpretation: string }[]>(raw);
    if (Array.isArray(interps)) {
      for (const item of interps) {
        const idx = (item.rank || 0) - 1;
        if (idx >= 0 && idx < scored.length && typeof item.interpretation === "string") {
          scored[idx].aiInterpretation = item.interpretation;
        }
      }
    }
  } catch {
    // AI interpretations are optional — silently continue
  }

  return {
    success: true,
    data: {
      scores: scored,
      methodology: { voteWeight: W.votes, relatedWeight: W.related, recencyWeight: W.recency, severityWeight: W.severity },
      generatedAt: new Date().toISOString(),
    },
  };
}
