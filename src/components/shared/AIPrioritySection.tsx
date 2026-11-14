"use client";

import { useState } from "react";
import {
  Bot,
  Loader2,
  Sparkles,
  Info,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { calculatePriorities } from "@/app/actions/ai";
import type { PriorityAnalysis } from "@/app/actions/ai";
import type { IssueCategory } from "@/types";
import { cn } from "@/lib/utils";

const VALID_CATS = [
  "infrastructure","safety","environment","transportation",
  "housing","education","health","technology","community","other",
];

export function AIPrioritySection() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PriorityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const run = async () => {
    setLoading(true);
    setError(null);
    const res = await calculatePriorities();
    setLoading(false);
    if (res.success && res.data) {
      setAnalysis(res.data);
    } else {
      setError(res.error ?? "Analysis failed.");
      setErrorCode(res.errorCode);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-civic-text">AI Priority Analysis</h2>
          <span className="text-xs text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full px-2 py-0.5">
            AI-assisted
          </span>
        </div>
        {!analysis && (
          <Button
            onClick={run}
            disabled={loading}
            className="gap-2 bg-purple-400/15 hover:bg-purple-400/25 border border-purple-400/30 text-purple-300"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run Analysis</>
            )}
          </Button>
        )}
        {analysis && (
          <Button
            onClick={run}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Refresh
          </Button>
        )}
      </div>

      {/* Methodology panel — always visible once expanded */}
      <div className="glass rounded-xl p-4 border border-white/7 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-civic-cyan" />
          <h3 className="text-sm font-semibold text-civic-text">Scoring Methodology</h3>
        </div>
        <p className="text-xs text-civic-text-muted mb-3">
          Priority scores are calculated from transparent, objective signals. AI provides
          interpretations only — it does not change the rankings.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Community Votes", weight: "40%", icon: Users, color: "#00d4ff", desc: "Unique supporters" },
            { label: "Recency", weight: "25%", icon: Clock, color: "#84cc16", desc: "Days since submitted" },
            { label: "Severity Signal", weight: "15%", icon: AlertTriangle, color: "#ef4444", desc: "Status + vote density" },
            { label: "Related Issues", weight: "20%", icon: TrendingUp, color: "#a855f7", desc: "Clustering factor" },
          ].map(({ label, weight, icon: Icon, color, desc }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 text-center"
              style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20` }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
              <p className="text-sm font-bold" style={{ color }}>{weight}</p>
              <p className="text-xs font-medium text-civic-text">{label}</p>
              <p className="text-xs text-civic-text-muted mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && !analysis && (
        <div className="glass rounded-xl p-6 border border-white/7 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-sm text-civic-text-muted">Calculating priorities and generating AI interpretations…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-xl p-4 border border-red-400/20 flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-medium">
              {errorCode === "NO_KEY" ? "AI unavailable" : "Analysis failed"}
            </p>
            <p className="text-xs text-civic-text-muted mt-0.5">
              {errorCode === "NO_KEY"
                ? "Add OPENROUTER_API_KEY to your .env.local to enable AI priority analysis."
                : error}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-3">
          {analysis.scores.map((score, idx) => (
            <div
              key={score.issueId}
              className="glass rounded-xl p-4 border border-white/7 hover:border-purple-400/15 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Rank badge */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 border",
                    idx === 0 && "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
                    idx === 1 && "bg-slate-400/10 border-slate-400/30 text-slate-400",
                    idx === 2 && "bg-amber-700/10 border-amber-700/30 text-amber-700",
                    idx > 2 && "bg-white/5 border-white/10 text-civic-text-muted"
                  )}
                >
                  {idx + 1}
                </div>

                {/* Issue info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {VALID_CATS.includes(score.category) && (
                      <CategoryBadge category={score.category as IssueCategory} size="sm" />
                    )}
                    <span className="text-xs text-civic-text-muted">{score.location}</span>
                  </div>
                  <p className="text-sm font-medium text-civic-text line-clamp-1 mb-2">
                    {score.title}
                  </p>

                  {/* Signal bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Votes", value: score.signals.votes, max: undefined, color: "#00d4ff", raw: true },
                      { label: "Recency", value: score.signals.recencyScore, max: 100, color: "#84cc16" },
                      { label: "Severity", value: score.signals.severityScore, max: 100, color: "#ef4444" },
                      { label: "Related", value: score.signals.relatedCount, max: undefined, color: "#a855f7", raw: true },
                    ].map(({ label, value, max, color, raw }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-civic-text-muted">{label}</span>
                          <span style={{ color }}>{raw ? value : `${value}/100`}</span>
                        </div>
                        {max !== undefined && (
                          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-purple-300 tabular-nums">{score.totalScore}</p>
                  <p className="text-xs text-civic-text-muted">/ 100</p>
                </div>
              </div>

              {/* AI interpretation */}
              {score.aiInterpretation && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2">
                  <Bot className="w-3 h-3 text-purple-400/60 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-civic-text-muted italic">{score.aiInterpretation}</p>
                </div>
              )}
            </div>
          ))}

          <p className="text-xs text-civic-text-muted text-center pt-2">
            Generated {new Date(analysis.generatedAt).toLocaleString()} · AI interpretations are advisory only
          </p>
        </div>
      )}

      {/* Call to action before running */}
      {!loading && !analysis && !error && (
        <div className="glass rounded-xl p-6 border border-white/7 text-center">
          <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto mb-3" />
          <p className="text-sm text-civic-text mb-1">
            Run AI analysis to see transparent priority scores
          </p>
          <p className="text-xs text-civic-text-muted">
            Scores are calculated from community votes, recency, and severity signals. AI adds brief interpretations.
          </p>
        </div>
      )}
    </div>
  );
}
