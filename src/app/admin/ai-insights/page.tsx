"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Loader2,
  BarChart3,
  MapPin,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCommunityInsights } from "@/app/actions/ai";
import type { CommunityInsights } from "@/app/actions/ai";

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<CommunityInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const run = async () => {
    setLoading(true);
    setError(null);
    const res = await generateCommunityInsights();
    setLoading(false);
    if (res.success && res.data) {
      setInsights(res.data);
    } else {
      setError(res.error ?? "Analysis failed.");
      setErrorCode(res.errorCode);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-civic-text">AI Community Insights</h1>
          </div>
          <p className="text-sm text-civic-text-muted">
            Identify patterns, recurring problems, and emerging concerns across all submissions.
          </p>
        </div>
        <Button
          onClick={run}
          disabled={loading}
          className="gap-2 bg-purple-400/15 hover:bg-purple-400/25 border border-purple-400/30 text-purple-300"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
          ) : insights ? (
            <><RefreshCw className="w-4 h-4" /> Regenerate</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Insights</>
          )}
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 glass rounded-xl p-4 border border-purple-400/15">
        <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-purple-400 mb-0.5">About this feature</p>
          <p className="text-xs text-civic-text-muted leading-relaxed">
            Calculated statistics are derived directly from submission data. AI interpretations
            identify patterns in that data and are clearly labeled. Neither replaces human judgment
            about community priorities.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-xl p-4 border border-red-400/20 flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-medium">
              {errorCode === "NO_KEY" ? "OpenRouter API key not configured" : "Analysis failed"}
            </p>
            <p className="text-xs text-civic-text-muted mt-0.5">
              {errorCode === "NO_KEY"
                ? "Add OPENROUTER_API_KEY to your .env.local to enable AI insights."
                : error}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass rounded-xl p-8 border border-white/7 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-civic-text">Analyzing community submissions…</p>
            <p className="text-xs text-civic-text-muted mt-1">
              Calculating statistics and identifying patterns. This may take a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {insights && !loading && (
        <>
          {/* ── Calculated Statistics ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-civic-cyan" />
              <h2 className="text-base font-semibold text-civic-text">Calculated Statistics</h2>
              <span className="text-xs text-civic-cyan/70 bg-civic-cyan/8 border border-civic-cyan/15 rounded-full px-2 py-0.5">
                from data
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Total Issues", value: insights.stats.totalIssues, color: "#00d4ff" },
                { label: "Top Category", value: insights.stats.topCategory, color: "#84cc16" },
                { label: "Avg Votes / Issue", value: insights.stats.avgVotesPerIssue, color: "#a855f7" },
                { label: "Resolved", value: insights.stats.resolvedCount, color: "#f59e0b" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="glass rounded-xl p-4 text-center border border-white/7"
                >
                  <p className="text-2xl font-bold capitalize" style={{ color }}>{value}</p>
                  <p className="text-xs text-civic-text-muted mt-1">{label}</p>
                </div>
              ))}
            </div>

            {insights.stats.geographicHotspots.length > 0 && (
              <div className="glass rounded-xl p-4 border border-white/7">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-civic-text-muted" />
                  <h3 className="text-sm font-semibold text-civic-text">Geographic Hotspots</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.stats.geographicHotspots.map(({ area, count }) => (
                    <div
                      key={area}
                      className="flex items-center gap-1.5 text-xs bg-civic-elevated border border-white/8 rounded-full px-3 py-1.5"
                    >
                      <span className="font-semibold text-civic-cyan">{count}</span>
                      <span className="text-civic-text">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── AI Interpretations ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-semibold text-civic-text">AI Interpretations</h2>
              <span className="text-xs text-purple-400/70 bg-purple-400/8 border border-purple-400/15 rounded-full px-2 py-0.5">
                AI-generated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Recurring Problems",
                  items: insights.aiInsights.recurringProblems,
                  icon: RefreshCw,
                  color: "#ef4444",
                },
                {
                  title: "Common Themes",
                  items: insights.aiInsights.commonThemes,
                  icon: TrendingUp,
                  color: "#00d4ff",
                },
                {
                  title: "Frequently Proposed Solutions",
                  items: insights.aiInsights.proposedSolutions,
                  icon: Lightbulb,
                  color: "#84cc16",
                },
                {
                  title: "Emerging Concerns",
                  items: insights.aiInsights.emergingConcerns,
                  icon: AlertTriangle,
                  color: "#f59e0b",
                },
              ].map(({ title, items, icon: Icon, color }) => (
                <div key={title} className="glass rounded-xl p-4 border border-white/7">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <h3 className="text-sm font-semibold text-civic-text">{title}</h3>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-civic-text-muted">No patterns identified.</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-civic-text-muted">
                          <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {insights.aiInsights.geographicPatterns.length > 0 && (
              <div className="glass rounded-xl p-4 border border-white/7 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-civic-text">Geographic Patterns</h3>
                </div>
                <ul className="space-y-2">
                  {insights.aiInsights.geographicPatterns.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-civic-text-muted">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <p className="text-xs text-civic-text-muted text-center pb-2">
            Generated {new Date(insights.generatedAt).toLocaleString()} ·
            AI interpretations are advisory and require human review
          </p>
        </>
      )}

      {/* Empty state */}
      {!insights && !loading && !error && (
        <div className="glass rounded-2xl p-12 border border-white/7 text-center">
          <Sparkles className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-civic-text mb-2">
            No analysis yet
          </h3>
          <p className="text-sm text-civic-text-muted max-w-sm mx-auto">
            Click &ldquo;Generate Insights&rdquo; to analyze all community submissions and identify patterns.
          </p>
        </div>
      )}
    </div>
  );
}
