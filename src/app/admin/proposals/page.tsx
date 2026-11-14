"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Loader2,
  CheckSquare,
  Square,
  Lightbulb,
  Save,
  Trash2,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { generateProposal, saveGeneratedProposal } from "@/app/actions/ai";
import { getIssues } from "@/app/actions/issues";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { ProposalDraft } from "@/app/actions/ai";
import type { IssueCategory } from "@/types";

const VALID_CATS = [
  "infrastructure","safety","environment","transportation",
  "housing","education","health","technology","community","other",
];

interface IssueListItem {
  id: string;
  title: string;
  category: string;
  status: string;
  votes: number;
  location: string;
}

export default function AdminProposalsPage() {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<ProposalDraft | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genErrorCode, setGenErrorCode] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load issues on mount
  useEffect(() => {
    const load = async () => {
      setIssuesLoading(true);
      if (hasSupabaseConfig()) {
        const res = await getIssues({ limit: 50 });
        if (res.data) {
          setIssues(
            res.data.map((r) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              status: r.status,
              votes: r.vote_count,
              location: r.location_area || r.location_name,
            }))
          );
        } else {
          // Fallback to demo
          setIssues(demoItems());
        }
      } else {
        setIssues(demoItems());
      }
      setIssuesLoading(false);
    };
    load();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    setDraft(null);
    setSaved(false);
    setSaveError(null);
    const res = await generateProposal([...selected]);
    setGenerating(false);
    if (res.success && res.data) {
      setDraft(res.data);
    } else {
      setGenError(res.error ?? "Generation failed.");
      setGenErrorCode(res.errorCode);
    }
  };

  const approve = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    const res = await saveGeneratedProposal(draft);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setDraft(null);
      setSelected(new Set());
    } else {
      setSaveError(res.error ?? "Save failed.");
    }
  };

  const discard = () => {
    setDraft(null);
    setGenError(null);
    setSaved(false);
    setSaveError(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-civic-lime" />
          <h1 className="text-xl font-bold text-civic-text">AI Proposal Generator</h1>
        </div>
        <p className="text-sm text-civic-text-muted">
          Select related issues and generate a structured community proposal. All proposals
          require admin approval before publishing.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 glass rounded-xl p-4 border border-purple-400/15">
        <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-civic-text-muted leading-relaxed">
          AI-generated proposals are drafts that require human review before publishing. They are
          labeled &ldquo;AI-generated&rdquo; on the public proposals page. Submitters whose issues
          are referenced are not automatically notified.
        </p>
      </div>

      {/* Saved success */}
      {saved && (
        <div className="flex items-center gap-3 glass rounded-xl p-4 border border-civic-lime/20">
          <CheckCircle className="w-5 h-5 text-civic-lime" />
          <div>
            <p className="text-sm font-semibold text-civic-lime">Proposal saved successfully</p>
            <p className="text-xs text-civic-text-muted mt-0.5">
              It is now visible on the public proposals page with an &ldquo;AI-generated&rdquo; label.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue selector */}
        <div className="glass rounded-2xl border border-white/7 overflow-hidden">
          <div className="p-4 border-b border-white/7 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-civic-text">Select Issues</h2>
              <p className="text-xs text-civic-text-muted mt-0.5">
                Choose 1–5 related issues to base the proposal on
              </p>
            </div>
            {selected.size > 0 && (
              <span className="flex items-center gap-1 text-xs text-civic-cyan bg-civic-cyan/10 border border-civic-cyan/20 rounded-full px-2 py-0.5">
                <Users className="w-3 h-3" />
                {selected.size} selected
              </span>
            )}
          </div>

          <div className="overflow-y-auto max-h-[480px]">
            {issuesLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-civic-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading issues…</span>
              </div>
            ) : issues.length === 0 ? (
              <p className="text-xs text-civic-text-muted text-center py-12">No issues found.</p>
            ) : (
              issues.map((issue) => {
                const isSelected = selected.has(issue.id);
                return (
                  <button
                    key={issue.id}
                    onClick={() => toggle(issue.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors text-left"
                    style={{ opacity: selected.size >= 5 && !isSelected ? 0.5 : 1 }}
                    disabled={selected.size >= 5 && !isSelected}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-civic-cyan flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-civic-text-muted flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {VALID_CATS.includes(issue.category) && (
                          <CategoryBadge category={issue.category as IssueCategory} size="sm" />
                        )}
                        <StatusBadge status={issue.status as "open"} type="issue" />
                      </div>
                      <p className="text-xs font-medium text-civic-text line-clamp-1">
                        {issue.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-civic-text-muted">
                        <span>{issue.location}</span>
                        <span className="text-civic-cyan font-medium">{issue.votes} votes</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-white/7">
            <Button
              onClick={generate}
              disabled={selected.size === 0 || generating}
              className="w-full gap-2 bg-purple-400/15 hover:bg-purple-400/25 border border-purple-400/30 text-purple-300"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Bot className="w-4 h-4" /><Sparkles className="w-3.5 h-3.5" /> Generate Proposal</>
              )}
            </Button>
            {selected.size === 0 && (
              <p className="text-xs text-civic-text-muted text-center mt-2">
                Select at least one issue above
              </p>
            )}
          </div>
        </div>

        {/* Draft / result panel */}
        <div>
          {/* Error */}
          {genError && !generating && (
            <div className="glass rounded-2xl p-5 border border-red-400/20 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">
                  {genErrorCode === "NO_KEY" ? "OpenRouter API key not configured" : "Generation failed"}
                </p>
                <p className="text-xs text-civic-text-muted mt-0.5">
                  {genErrorCode === "NO_KEY"
                    ? "Add OPENROUTER_API_KEY to your .env.local to enable AI proposal generation."
                    : genError}
                </p>
              </div>
            </div>
          )}

          {/* Generating placeholder */}
          {generating && (
            <div className="glass rounded-2xl p-8 border border-white/7 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-civic-text">Generating proposal…</p>
                <p className="text-xs text-civic-text-muted mt-1">
                  Analyzing {selected.size} selected issue{selected.size !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Draft */}
          {draft && !generating && (
            <div className="glass rounded-2xl border border-purple-400/20 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-purple-400/15 bg-purple-400/5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  AI Draft — Requires Approval
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-civic-text-muted mb-1">Title</p>
                  <h3 className="text-base font-bold text-civic-text">{draft.title}</h3>
                </div>

                <div>
                  <p className="text-xs text-civic-text-muted mb-1">Problem Statement</p>
                  <p className="text-sm text-civic-text leading-relaxed">{draft.problemStatement}</p>
                </div>

                <div>
                  <p className="text-xs text-civic-text-muted mb-1">Proposed Solution</p>
                  <p className="text-sm text-civic-text leading-relaxed">{draft.proposedSolution}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-lg bg-civic-elevated/50 border border-white/8 p-3">
                    <p className="text-xs text-civic-text-muted mb-0.5">Relevant Stakeholder</p>
                    <p className="text-sm text-civic-cyan font-medium">{draft.relevantStakeholder}</p>
                  </div>
                  <div className="rounded-lg bg-civic-elevated/50 border border-white/8 p-3">
                    <p className="text-xs text-civic-text-muted mb-0.5">Recommended Next Step</p>
                    <p className="text-sm text-civic-text">{draft.recommendedNextStep}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-civic-text-muted mb-2">Based on {draft.supportingIssueTitles.length} issue{draft.supportingIssueTitles.length !== 1 ? "s" : ""}</p>
                  <ul className="space-y-1">
                    {draft.supportingIssueTitles.map((t, i) => (
                      <li key={i} className="text-xs text-civic-text-muted flex items-start gap-1.5">
                        <span className="text-civic-cyan mt-0.5">·</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {saveError && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={approve}
                    disabled={saving}
                    className="flex-1 gap-2 shadow-glow-cyan-sm"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="w-4 h-4" /> Approve & Publish</>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={discard} disabled={saving} className="gap-1.5">
                    <Trash2 className="w-4 h-4" /> Discard
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!draft && !generating && !genError && (
            <div className="glass rounded-2xl p-12 border border-white/7 text-center h-full flex flex-col items-center justify-center gap-4">
              <Lightbulb className="w-12 h-12 text-civic-lime/30" />
              <div>
                <p className="text-sm font-medium text-civic-text">No proposal generated yet</p>
                <p className="text-xs text-civic-text-muted mt-1 max-w-xs mx-auto">
                  Select one or more related issues from the list and click &ldquo;Generate Proposal&rdquo;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function demoItems(): IssueListItem[] {
  return DEMO_ISSUES.map((i) => ({
    id: i.id,
    title: i.title,
    category: i.category,
    status: i.status,
    votes: i.votes,
    location: i.location.area || i.location.name,
  }));
}
