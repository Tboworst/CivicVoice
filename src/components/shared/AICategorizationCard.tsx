"use client";

import { Bot, Sparkles, CheckCircle, XCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { cn } from "@/lib/utils";
import type { IssueCategorization } from "@/app/actions/ai";
import type { IssueCategory } from "@/types";

interface AICategorizationCardProps {
  loading: boolean;
  analysis: IssueCategorization | null;
  error: string | null;
  errorCode?: string;
  onApply: (category: string, tags: string[]) => void;
  onDismiss: () => void;
  onRetry: () => void;
}

export function AICategorizationCard({
  loading,
  analysis,
  error,
  errorCode,
  onApply,
  onDismiss,
  onRetry,
}: AICategorizationCardProps) {
  const confidencePct = analysis ? Math.round(analysis.confidence * 100) : 0;
  const confidenceColor =
    confidencePct >= 80 ? "#84cc16" : confidencePct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-400/15">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            AI Suggestion
          </span>
        </div>
        {!loading && (
          <button
            onClick={onDismiss}
            className="text-civic-text-muted hover:text-civic-text transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-3">
            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-civic-text-muted">Analyzing your issue…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">
                  {errorCode === "NO_KEY"
                    ? "AI suggestions unavailable"
                    : errorCode === "TIMEOUT"
                    ? "Request timed out"
                    : "Analysis failed"}
                </p>
                <p className="text-xs text-civic-text-muted mt-0.5">
                  {errorCode === "NO_KEY"
                    ? "Add an OpenRouter API key to enable AI categorization."
                    : error}
                </p>
              </div>
            </div>
            {errorCode !== "NO_KEY" && (
              <Button size="sm" variant="secondary" onClick={onRetry} className="gap-1.5 h-7 text-xs">
                <RefreshCw className="w-3 h-3" /> Try Again
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && !error && analysis && (
          <div className="space-y-3">
            {/* Category + confidence */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-civic-text-muted">Suggested:</span>
                {VALID_DISPLAY_CATEGORIES.includes(analysis.category) ? (
                  <CategoryBadge category={analysis.category as IssueCategory} size="sm" />
                ) : (
                  <span className="text-xs text-civic-text capitalize bg-white/8 border border-white/10 rounded-full px-2 py-0.5">
                    {analysis.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${confidencePct}%`, backgroundColor: confidenceColor }}
                  />
                </div>
                <span className="text-xs tabular-nums" style={{ color: confidenceColor }}>
                  {confidencePct}%
                </span>
              </div>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <p className="text-xs text-civic-text leading-relaxed">{analysis.summary}</p>
            )}

            {/* Tags */}
            {analysis.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {analysis.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-civic-text-muted bg-white/5 border border-white/8 rounded-full px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-1.5 text-xs">
              {analysis.mainConcern && (
                <div className="flex gap-2">
                  <span className="text-civic-text-muted flex-shrink-0">Concern:</span>
                  <span className="text-civic-text">{analysis.mainConcern}</span>
                </div>
              )}
              {analysis.suggestedStakeholder && (
                <div className="flex gap-2">
                  <span className="text-civic-text-muted flex-shrink-0">Stakeholder:</span>
                  <span className="text-civic-text">{analysis.suggestedStakeholder}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => onApply(analysis.category, analysis.tags)}
                className={cn(
                  "gap-1.5 h-7 text-xs",
                  "bg-purple-400/15 hover:bg-purple-400/25 border border-purple-400/30 text-purple-300"
                )}
              >
                <CheckCircle className="w-3 h-3" />
                Apply Suggestions
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="gap-1.5 h-7 text-xs text-civic-text-muted"
              >
                <RefreshCw className="w-3 h-3" />
                Re-analyze
              </Button>
            </div>
          </div>
        )}

        {/* Empty (before first run) */}
        {!loading && !error && !analysis && (
          <div className="flex items-center gap-2.5 py-1">
            <Sparkles className="w-4 h-4 text-purple-400/60" />
            <p className="text-xs text-civic-text-muted">
              Click &ldquo;Get AI Suggestions&rdquo; to automatically categorize your issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const VALID_DISPLAY_CATEGORIES = [
  "infrastructure", "safety", "environment", "transportation",
  "housing", "education", "health", "technology", "community", "other",
];
