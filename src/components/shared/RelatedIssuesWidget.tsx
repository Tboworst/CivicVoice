"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, MapPin, Loader2, XCircle, ExternalLink } from "lucide-react";
import { findRelatedIssues } from "@/app/actions/ai";
import type { RelatedIssueResult } from "@/app/actions/ai";

interface RelatedIssuesWidgetProps {
  issueId: string;
  title: string;
  description: string;
  location: string;
  category: string;
}

export function RelatedIssuesWidget({
  issueId,
  title,
  description,
  location,
  category,
}: RelatedIssuesWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RelatedIssueResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    findRelatedIssues(issueId, title, description, location, category).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setError(res.error ?? "Could not load related issues.");
        setErrorCode(res.errorCode);
      }
    });

    return () => { cancelled = true; };
  }, [issueId, title, description, location, category]);

  // Don't render anything if no key configured
  if (!loading && errorCode === "NO_KEY") return null;

  return (
    <div className="glass rounded-2xl p-5 border border-white/7">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-civic-text">AI: Similar Issues</h2>
        <span className="ml-auto text-xs text-purple-400/70 bg-purple-400/8 border border-purple-400/15 rounded-full px-2 py-0.5">
          AI-detected
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2.5 py-3 text-civic-text-muted">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span className="text-sm">Finding related issues…</span>
        </div>
      )}

      {/* Error (non-NO_KEY) */}
      {!loading && error && errorCode !== "NO_KEY" && (
        <div className="flex items-start gap-2 py-1">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-civic-text-muted">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && results.length === 0 && (
        <p className="text-xs text-civic-text-muted py-1">
          No closely related issues found in the database.
        </p>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => (
            <Link
              key={r.issueId}
              href={`/issues/${r.issueId}`}
              className="block p-3 rounded-xl bg-civic-elevated/50 border border-white/7 hover:border-purple-400/20 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-civic-text group-hover:text-purple-300 transition-colors line-clamp-1">
                  {r.title}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: scoreColor(r.similarityScore) }}
                  >
                    {Math.round(r.similarityScore * 100)}%
                  </span>
                  <ExternalLink className="w-3 h-3 text-civic-text-muted group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
              <p className="text-xs text-civic-text-muted mt-1 leading-relaxed line-clamp-2">
                {r.similarityReason}
              </p>
              {r.isGeographicallyClose && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-civic-cyan/70">
                  <MapPin className="w-3 h-3" />
                  Nearby location
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-civic-text-muted/50 mt-3 pt-3 border-t border-white/5">
        Similarity detected by AI — human review recommended before merging.
      </p>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 0.8) return "#84cc16";
  if (score >= 0.6) return "#f59e0b";
  return "#00d4ff";
}
