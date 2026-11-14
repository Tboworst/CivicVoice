export const revalidate = 300;

import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  CircleDot,
  Calendar,
  ExternalLink,
  AlertCircle,
  XCircle,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { getAccountabilityData } from "@/app/actions/geography";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { IssueCategory } from "@/types";

// Status display config — covers both demo values and DB values
const STATUS_META: Record<
  string,
  {
    label: string;
    icon: typeof CircleDot;
    color: string;
  }
> = {
  pending: {
    label: "Awaiting Response",
    icon: CircleDot,
    color: "#64748b",
  },
  acknowledged: {
    label: "Acknowledged",
    icon: CircleDot,
    color: "#3b82f6",
  },
  committed: {
    label: "Committed",
    icon: Clock,
    color: "#6366f1",
  },
  in_progress: {
    label: "Action in Progress",
    icon: Clock,
    color: "#f59e0b",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "#84cc16",
  },
  completed: {
    label: "Completed",
    icon: CheckSquare,
    color: "#84cc16",
  },
  dismissed: {
    label: "Dismissed",
    icon: XCircle,
    color: "#ef4444",
  },
};

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META["pending"];
}

// Summary counts using the broader status set
const SUMMARY_STATUSES = [
  { key: "pending", label: "Awaiting" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

export default async function AccountabilityPage() {
  const { entries, awaitingIssues, fromDB } = await getAccountabilityData();

  // Count by status group
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    // Map legacy demo statuses to summary buckets
    let bucket = entry.status;
    if (bucket === "completed") bucket = "resolved";
    if (bucket === "committed") bucket = "acknowledged";
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  }

  const institutions = [...new Set(entries.map((e) => e.institution))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-civic-text flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-civic-lime" />
            Accountability Tracker
          </h1>
          <p className="text-civic-text-muted mt-1">
            Every institutional response to community concerns — documented and
            tracked until resolved.
          </p>
        </div>
        {!fromDB && <DemoNotice inline />}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-5 border border-white/7 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-civic-cyan flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-civic-text mb-1">
              How This Works
            </h2>
            <p className="text-sm text-civic-text-muted leading-relaxed">
              When community issues gain enough support, they are formally
              submitted to relevant institutions. CivicVoice records all
              responses, tracks commitments against deadlines, and makes the
              full record publicly visible. We only document what institutions
              actually say and do — no fabricated progress is ever shown.
            </p>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {SUMMARY_STATUSES.map(({ key, label }) => {
          const meta = getStatusMeta(key);
          const count = counts[key] ?? 0;
          return (
            <div
              key={key}
              className="glass rounded-xl p-4 text-center border border-white/7"
              style={{
                borderColor: `${meta.color}20`,
                backgroundColor: `${meta.color}08`,
              }}
            >
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: meta.color }}
              >
                {count}
              </p>
              <p className="text-xs text-civic-text-muted mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Institution list */}
      {institutions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-civic-text mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-civic-text-muted" />
            Responding Institutions
          </h2>
          <div className="flex flex-wrap gap-2">
            {institutions.map((inst) => {
              const shortName = inst.split(" — ")[0] || inst;
              const count = entries.filter((e) => e.institution === inst).length;
              return (
                <div
                  key={inst}
                  className="glass rounded-lg px-3 py-2 border border-white/8 text-xs"
                >
                  <span className="text-civic-text font-medium">{shortName}</span>
                  <span className="text-civic-text-muted ml-1.5">
                    {count} response{count !== 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-civic-text mb-6">
            Response Timeline
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-white/8" />

            <div className="space-y-6">
              {entries.map((entry) => {
                const meta = getStatusMeta(entry.status);
                const StatusIcon = meta.icon;

                return (
                  <div key={entry.id} className="relative pl-16">
                    {/* Timeline node */}
                    <div
                      className="absolute left-3.5 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                      style={{
                        backgroundColor: `${meta.color}20`,
                        borderColor: meta.color,
                      }}
                    >
                      <StatusIcon
                        className="w-3 h-3"
                        style={{ color: meta.color }}
                      />
                    </div>

                    {/* Card */}
                    <div className="glass rounded-2xl p-5 border border-white/7 hover:border-white/12 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5"
                              style={{
                                backgroundColor: `${meta.color}12`,
                                border: `1px solid ${meta.color}25`,
                                color: meta.color,
                              }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-civic-cyan">
                            {entry.institution}
                          </p>
                          {entry.contactName && (
                            <p className="text-xs text-civic-text-muted">
                              {entry.contactName}
                              {entry.contactTitle && (
                                <> · {entry.contactTitle}</>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-civic-text-muted">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.respondedAt)}
                          </div>
                          <p className="text-xs text-civic-text-muted mt-0.5">
                            {formatRelativeDate(entry.respondedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Issue reference */}
                      {entry.issueTitle && (
                        <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 mb-3">
                          <span className="text-xs text-civic-text-muted">
                            In response to:
                          </span>
                          <Link
                            href={`/issues/${entry.issueId}`}
                            className="text-xs text-civic-cyan hover:underline flex items-center gap-1 line-clamp-1"
                          >
                            {entry.issueTitle}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </Link>
                        </div>
                      )}

                      <p className="text-sm text-civic-text-muted leading-relaxed">
                        {entry.response}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 border border-white/7 text-center">
          <ShieldCheck className="w-10 h-10 text-civic-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-civic-text-muted text-sm">
            No institutional responses have been recorded yet.
          </p>
        </div>
      )}

      {/* Open issues awaiting response */}
      {awaitingIssues.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-civic-text mb-4">
            Awaiting Institutional Response
          </h2>
          <p className="text-sm text-civic-text-muted mb-5">
            High-priority issues that have not yet received an institutional
            response. The community is watching.
          </p>
          <div className="space-y-3">
            {awaitingIssues.map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <div className="glass rounded-xl p-4 border border-white/7 hover:border-civic-red/15 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge
                        category={issue.category as IssueCategory}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm font-medium text-civic-text line-clamp-1">
                      {issue.title}
                    </p>
                    <p className="text-xs text-civic-text-muted mt-0.5">
                      {issue.location.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-civic-cyan">
                      {issue.votes}
                    </p>
                    <p className="text-xs text-civic-text-muted">votes</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Institution directory link */}
      <div className="mt-8 glass rounded-xl p-4 border border-white/7 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-civic-text">
            Looking for a specific institution?
          </p>
          <p className="text-xs text-civic-text-muted mt-0.5">
            Browse the full directory of institutions active in Towson.
          </p>
        </div>
        <Link href="/institutions">
          <Button variant="secondary" size="sm" className="gap-1.5 flex-shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            Institution Directory
          </Button>
        </Link>
      </div>

      {/* CTA */}
      <div className="mt-6 glass rounded-2xl p-6 border border-civic-lime/15 text-center">
        <ShieldCheck className="w-10 h-10 text-civic-lime mx-auto mb-3" />
        <h2 className="text-lg font-bold text-civic-text mb-2">
          Hold institutions accountable
        </h2>
        <p className="text-sm text-civic-text-muted max-w-lg mx-auto mb-5">
          When issues reach high community support, CivicVoice formally submits
          them to the relevant institution. Submit issues. Vote. Keep the
          pressure on.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/submit">
            <Button className="gap-2">Submit an Issue</Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" className="gap-2">
              Explore Issues
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
