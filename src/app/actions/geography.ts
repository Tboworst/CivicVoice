"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { DEMO_ISSUES, DEMO_INSTITUTIONAL_RESPONSES } from "@/lib/demo-data";
import type { Issue } from "@/types";
import type { Database } from "@/lib/supabase/types";

type IssueRow = Database["public"]["Tables"]["issues"]["Row"];
type InstitutionalResponseRow =
  Database["public"]["Tables"]["institutional_responses"]["Row"];
type InstitutionRow = Database["public"]["Tables"]["institutions"]["Row"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) {
  return supabase;
}

function rowToIssue(r: IssueRow): Issue {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as Issue["category"],
    status: r.status,
    votes: r.vote_count,
    submittedAt: r.created_at,
    location: {
      name: r.location_name,
      lat: r.location_lat,
      lng: r.location_lng,
      area: r.location_area ?? undefined,
    },
    tags: r.tags,
    commentCount: r.comment_count,
    reporterType: (r.reporter_type as Issue["reporterType"]) ?? undefined,
  };
}

// ── Map data ─────────────────────────────────────────────────────────────────

export async function getIssuesForMap(): Promise<{
  issues: Issue[];
  fromDB: boolean;
}> {
  if (!hasSupabaseConfig()) return { issues: DEMO_ISSUES, fromDB: false };
  try {
    const supabase = await createClient();
    const { data, error } = (await db(supabase)
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300)) as { data: IssueRow[] | null; error: unknown };
    if (error || !data || data.length === 0)
      return { issues: DEMO_ISSUES, fromDB: false };
    return { issues: data.map(rowToIssue), fromDB: true };
  } catch {
    return { issues: DEMO_ISSUES, fromDB: false };
  }
}

// ── Area statistics ───────────────────────────────────────────────────────────

export interface AreaStat {
  area: string;
  count: number;
  topCategory: string;
}

export async function getAreaStats(): Promise<AreaStat[]> {
  let rows: { area: string; category: string }[] | null = null;

  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { data } = (await db(supabase)
        .from("issues")
        .select("location_area, location_name, category")) as {
        data:
          | { location_area: string | null; location_name: string; category: string }[]
          | null;
      };
      if (data) {
        rows = data.map((r) => ({
          area: r.location_area ?? r.location_name,
          category: r.category,
        }));
      }
    } catch {
      /* fall through */
    }
  }

  if (!rows) {
    rows = DEMO_ISSUES.map((i) => ({
      area: i.location.area ?? i.location.name,
      category: i.category,
    }));
  }

  const areaMap = new Map<string, { count: number; cats: Record<string, number> }>();
  for (const row of rows) {
    const entry = areaMap.get(row.area) ?? { count: 0, cats: {} };
    entry.count++;
    entry.cats[row.category] = (entry.cats[row.category] ?? 0) + 1;
    areaMap.set(row.area, entry);
  }

  return [...areaMap.entries()]
    .map(([area, { count, cats }]) => ({
      area,
      count,
      topCategory:
        Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalIssues: number;
  totalVotes: number;
  resolvedIssues: number;
  activeProposals: number;
  institutionalResponses: number;
  fromDB: boolean;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!hasSupabaseConfig()) {
    return {
      totalIssues: 10,
      totalVotes: 2847,
      resolvedIssues: 2,
      activeProposals: 5,
      institutionalResponses: 5,
      fromDB: false,
    };
  }
  try {
    const supabase = await createClient();
    const [issuesRes, proposalsRes, responsesRes] = await Promise.all([
      db(supabase).from("issues").select("status, vote_count") as Promise<{
        data: { status: string; vote_count: number }[] | null;
      }>,
      db(supabase).from("proposals").select("status") as Promise<{
        data: { status: string }[] | null;
      }>,
      db(supabase).from("institutional_responses").select("id") as Promise<{
        data: { id: string }[] | null;
      }>,
    ]);

    const issues = issuesRes.data ?? [];
    const proposals = proposalsRes.data ?? [];
    const responses = responsesRes.data ?? [];

    return {
      totalIssues: issues.length,
      totalVotes: issues.reduce((s, i) => s + (i.vote_count ?? 0), 0),
      resolvedIssues: issues.filter((i) => i.status === "resolved").length,
      activeProposals: proposals.filter(
        (p) => p.status === "proposed" || p.status === "under_review"
      ).length,
      institutionalResponses: responses.length,
      fromDB: true,
    };
  } catch {
    return {
      totalIssues: 0,
      totalVotes: 0,
      resolvedIssues: 0,
      activeProposals: 0,
      institutionalResponses: 0,
      fromDB: false,
    };
  }
}

// ── Institutions ──────────────────────────────────────────────────────────────

export interface InstitutionItem {
  id: string;
  name: string;
  type: string;
  website: string | null;
  responseCount: number;
}

const DEMO_INSTITUTIONS: InstitutionItem[] = [
  {
    id: "a1",
    name: "Towson University",
    type: "university",
    website: "https://www.towson.edu",
    responseCount: 2,
  },
  {
    id: "a2",
    name: "Office of Facilities Management",
    type: "university_dept",
    website: "https://www.towson.edu/facilities",
    responseCount: 1,
  },
  {
    id: "a3",
    name: "Office of Student Affairs",
    type: "university_dept",
    website: "https://www.towson.edu/student-affairs",
    responseCount: 0,
  },
  {
    id: "a4",
    name: "Baltimore County Government",
    type: "government",
    website: "https://www.baltimorecountymd.gov",
    responseCount: 1,
  },
  {
    id: "a5",
    name: "Baltimore County Dept. of Transportation",
    type: "government_dept",
    website: "https://www.baltimorecountymd.gov/departments/publicworks/transportation",
    responseCount: 1,
  },
  {
    id: "a6",
    name: "Maryland Transit Administration",
    type: "government_dept",
    website: "https://www.mta.maryland.gov",
    responseCount: 0,
  },
  {
    id: "a7",
    name: "Greater Towson Council of Community Assns.",
    type: "community",
    website: null,
    responseCount: 0,
  },
];

export async function getInstitutions(): Promise<{
  items: InstitutionItem[];
  fromDB: boolean;
}> {
  if (!hasSupabaseConfig()) return { items: DEMO_INSTITUTIONS, fromDB: false };
  try {
    const supabase = await createClient();
    const [instRes, respRes] = await Promise.all([
      db(supabase).from("institutions").select("*") as Promise<{
        data: InstitutionRow[] | null;
      }>,
      db(supabase)
        .from("institutional_responses")
        .select("institution_id") as Promise<{
        data: { institution_id: string | null }[] | null;
      }>,
    ]);
    const institutions = instRes.data ?? [];
    if (institutions.length === 0) return { items: DEMO_INSTITUTIONS, fromDB: false };

    const countMap = new Map<string, number>();
    for (const r of respRes.data ?? []) {
      if (r.institution_id)
        countMap.set(r.institution_id, (countMap.get(r.institution_id) ?? 0) + 1);
    }
    return {
      items: institutions.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        website: i.website,
        responseCount: countMap.get(i.id) ?? 0,
      })),
      fromDB: true,
    };
  } catch {
    return { items: DEMO_INSTITUTIONS, fromDB: false };
  }
}

// ── Accountability ────────────────────────────────────────────────────────────

export interface AccountabilityEntry {
  id: string;
  institution: string;
  issueId: string;
  issueTitle: string;
  response: string;
  status: string;
  respondedAt: string;
  contactName: string | null;
  contactTitle: string | null;
}

export async function getAccountabilityData(): Promise<{
  entries: AccountabilityEntry[];
  awaitingIssues: Issue[];
  fromDB: boolean;
}> {
  if (!hasSupabaseConfig()) {
    const entries: AccountabilityEntry[] = DEMO_INSTITUTIONAL_RESPONSES.map(
      (r) => ({
        id: r.id,
        institution: r.institution,
        issueId: r.issueId,
        issueTitle: r.issueTitle ?? "",
        response: r.response,
        status: r.status,
        respondedAt: r.date,
        contactName: r.contactName ?? null,
        contactTitle: r.contactTitle ?? null,
      })
    );
    const respondedIds = new Set(entries.map((e) => e.issueId));
    const awaitingIssues = DEMO_ISSUES.filter(
      (i) => !respondedIds.has(i.id) && i.votes > 100
    )
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);
    return { entries, awaitingIssues, fromDB: false };
  }

  try {
    const supabase = await createClient();

    const { data: respData } = (await db(supabase)
      .from("institutional_responses")
      .select("*, issues(title)")
      .order("responded_at", { ascending: false })) as {
      data:
        | (InstitutionalResponseRow & { issues: { title: string } | null })[]
        | null;
    };

    const entries: AccountabilityEntry[] = (respData ?? []).map((r) => ({
      id: r.id,
      institution: r.institution,
      issueId: r.issue_id,
      issueTitle: r.issues?.title ?? "",
      response: r.response,
      status: r.status,
      respondedAt: r.responded_at,
      contactName: r.contact_name,
      contactTitle: r.contact_title,
    }));

    const respondedIds = new Set(entries.map((e) => e.issueId));

    const { data: issueData } = (await db(supabase)
      .from("issues")
      .select("*")
      .gt("vote_count", 50)
      .order("vote_count", { ascending: false })
      .limit(30)) as { data: IssueRow[] | null };

    const awaitingIssues = (issueData ?? [])
      .filter((r) => !respondedIds.has(r.id))
      .slice(0, 5)
      .map(rowToIssue);

    return { entries, awaitingIssues, fromDB: true };
  } catch {
    return { entries: [], awaitingIssues: [], fromDB: false };
  }
}

// ── Trending issues ───────────────────────────────────────────────────────────
// Score = votes / max(1, days_since_created)  →  most votes-per-day wins

export async function getTrendingIssues(limit = 5): Promise<Issue[]> {
  const now = Date.now();

  if (!hasSupabaseConfig()) {
    return [...DEMO_ISSUES]
      .map((i) => {
        const days = Math.max(1, (now - new Date(i.submittedAt).getTime()) / 86_400_000);
        return { issue: i, score: i.votes / days };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.issue);
  }

  try {
    const supabase = await createClient();
    const { data, error } = (await db(supabase)
      .from("issues")
      .select("*")
      .order("vote_count", { ascending: false })
      .limit(50)) as { data: IssueRow[] | null; error: unknown };

    if (error || !data) return DEMO_ISSUES.slice(0, limit);

    return data
      .map((r) => {
        const days = Math.max(1, (now - new Date(r.created_at).getTime()) / 86_400_000);
        return { issue: rowToIssue(r), score: r.vote_count / days };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.issue);
  } catch {
    return DEMO_ISSUES.slice(0, limit);
  }
}
