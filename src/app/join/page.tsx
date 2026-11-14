"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, TrendingUp, ExternalLink, Check, Loader2, MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
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

const TOP_ISSUES = [...DEMO_ISSUES].sort((a, b) => b.votes - a.votes).slice(0, 6);

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
      if (result.success && typeof result.newCount === "number") {
        setCounts((prev) => ({ ...prev, [issue.id]: result.newCount! }));
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
    <div className="min-h-screen flex flex-col bg-civic-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/7 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-civic-cyan/20 border border-civic-cyan/40 flex items-center justify-center">
            <Radio className="w-3 h-3 text-civic-cyan" />
          </div>
          <span className="font-bold text-sm text-civic-text">CivicVoice</span>
        </div>
        <Link
          href="/explore"
          className="text-xs text-civic-text-muted hover:text-civic-cyan flex items-center gap-1 transition-colors"
        >
          Full site <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">

        {/* What is this */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-civic-cyan/10 border border-civic-cyan/20 text-civic-cyan text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-cyan animate-pulse" />
            Live Community Session
          </div>
          <h1 className="text-2xl font-bold text-civic-text mb-2">
            What matters most to Towson?
          </h1>
          <p className="text-sm text-civic-text-muted max-w-sm mx-auto leading-relaxed">
            These are real issues reported by residents, students, and community
            members. Vote for the ones that matter to you — no sign-in required.
            Every vote shapes the community priority list.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 text-sm">
            <span className="text-3xl font-bold text-civic-cyan tabular-nums">
              {totalVotes.toLocaleString()}
            </span>
            <span className="text-civic-text-muted">total community votes</span>
          </div>
        </div>

        {/* How it works — 3 steps */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: "1", label: "Read the issue" },
            { step: "2", label: "Tap to vote" },
            { step: "3", label: "See it live" },
          ].map(({ step, label }) => (
            <div
              key={step}
              className="glass rounded-xl p-3 border border-white/7 text-center"
            >
              <div className="w-6 h-6 rounded-full bg-civic-cyan/20 text-civic-cyan text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                {step}
              </div>
              <p className="text-xs text-civic-text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Issue voting cards */}
        <div className="space-y-3 mb-8">
          {TOP_ISSUES.map((issue) => {
            const hasVoted = votedIds.has(issue.id);
            const isLoading = loadingId === issue.id;
            const voteCount = counts[issue.id] ?? issue.votes;

            return (
              <div
                key={issue.id}
                className={`glass rounded-2xl p-4 border transition-colors ${
                  hasVoted ? "border-civic-cyan/30 bg-civic-cyan/3" : "border-white/7"
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <CategoryBadge category={issue.category} />
                </div>
                <h3 className="text-sm font-semibold text-civic-text leading-snug mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-civic-text-muted leading-relaxed mb-3 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs text-civic-text-muted">
                    <MapPin className="w-3 h-3" />
                    {issue.location.name}
                  </div>
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
        <div className="glass rounded-2xl p-5 border border-white/7 text-center space-y-3">
          <p className="text-sm font-medium text-civic-text">
            See something not on this list?
          </p>
          <p className="text-xs text-civic-text-muted">
            Browse all {DEMO_ISSUES.length} reported issues or submit one of your own.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 text-xs">
              <Link href="/explore">
                <QrCode className="w-3.5 h-3.5" />
                Browse Issues
              </Link>
            </Button>
            <Button asChild className="flex-1 text-xs">
              <Link href="/submit">
                <ExternalLink className="w-3.5 h-3.5" />
                Report Issue
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
