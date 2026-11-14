"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, TrendingUp, ExternalLink, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { voteForIssue } from "@/app/actions/votes";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Issue } from "@/types";

const SESSION_KEY = "civic_session_id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Top 5 issues by votes for quick participation
const TOP_ISSUES = [...DEMO_ISSUES]
  .sort((a, b) => b.votes - a.votes)
  .slice(0, 5);

export default function JoinPage() {
  const [sessionId, setSessionId] = useState("");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEMO_ISSUES.map((i) => [i.id, i.votes]))
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    // Restore from localStorage
    const voted = new Set<string>();
    DEMO_ISSUES.forEach((i) => {
      if (localStorage.getItem(`voted_issue_${i.id}`) === "1") voted.add(i.id);
    });
    setVotedIds(voted);
  }, []);

  async function handleVote(issue: Issue) {
    if (votedIds.has(issue.id) || loadingId) return;
    setLoadingId(issue.id);

    if (hasSupabaseConfig()) {
      const result = await voteForIssue(issue.id, sessionId);
      if (result.success) {
        if (typeof result.newCount === "number") {
          setCounts((prev) => ({ ...prev, [issue.id]: result.newCount! }));
        }
      }
    } else {
      setCounts((prev) => ({ ...prev, [issue.id]: prev[issue.id] + 1 }));
    }

    setVotedIds((prev) => new Set([...prev, issue.id]));
    localStorage.setItem(`voted_issue_${issue.id}`, "1");
    setLoadingId(null);
  }

  const totalVotes = Object.values(counts).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/7 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-civic-cyan" />
          <span className="font-bold text-sm">CivicVoice</span>
        </div>
        <Link
          href="/explore"
          className="text-xs text-civic-text-muted hover:text-civic-cyan flex items-center gap-1"
        >
          Full site <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-civic-cyan/10 border border-civic-cyan/20 text-civic-cyan text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Radio className="w-3 h-3" />
            Live Participation
          </div>
          <h1 className="text-2xl font-bold text-civic-text mb-2">
            Vote on Community Issues
          </h1>
          <p className="text-sm text-civic-text-muted">
            Support the issues that matter most to Towson. No sign-in required.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-sm">
            <span className="text-3xl font-bold text-civic-cyan tabular-nums">
              {totalVotes.toLocaleString()}
            </span>
            <span className="text-civic-text-muted">total community votes</span>
          </div>
        </div>

        {/* Issue voting cards */}
        <div className="space-y-3">
          {TOP_ISSUES.map((issue) => {
            const hasVoted = votedIds.has(issue.id);
            const isLoading = loadingId === issue.id;
            const voteCount = counts[issue.id] ?? issue.votes;

            return (
              <div
                key={issue.id}
                className={`glass rounded-2xl p-4 border transition-colors ${
                  hasVoted ? "border-civic-cyan/30" : "border-white/7"
                }`}
              >
                <div className="flex gap-2 mb-2 flex-wrap">
                  <CategoryBadge category={issue.category} />
                  <StatusBadge status={issue.status} type="issue" />
                </div>
                <h3 className="text-sm font-semibold text-civic-text leading-snug mb-3">
                  {issue.title}
                </h3>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-civic-text-muted">
                    {issue.location.name}
                  </span>
                  <button
                    onClick={() => handleVote(issue)}
                    disabled={hasVoted || !!loadingId}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                      hasVoted
                        ? "bg-civic-cyan/20 text-civic-cyan border border-civic-cyan/30 cursor-default"
                        : "bg-civic-cyan text-civic-bg hover:bg-civic-cyan/90 active:scale-95"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : hasVoted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                    <span className="tabular-nums">{voteCount}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 glass rounded-2xl p-5 text-center border border-white/7">
          <p className="text-sm text-civic-text-muted mb-3">
            See all {DEMO_ISSUES.length} community issues and explore the full platform
          </p>
          <Button asChild className="w-full">
            <Link href="/explore">
              <ExternalLink className="w-4 h-4" />
              Explore All Issues
            </Link>
          </Button>
          <div className="mt-3 flex justify-center gap-4 text-xs text-civic-text-muted">
            <Link href="/submit" className="hover:text-civic-cyan transition-colors">
              Report an issue
            </Link>
            <Link href="/proposals" className="hover:text-civic-cyan transition-colors">
              View proposals
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
