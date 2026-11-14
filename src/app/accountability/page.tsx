import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  CircleDot,
  Calendar,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import {
  DEMO_INSTITUTIONAL_RESPONSES,
  DEMO_ISSUES,
} from "@/lib/demo-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { InstitutionResponseStatus } from "@/types";

const statusOrder: InstitutionResponseStatus[] = [
  "acknowledged",
  "committed",
  "in_progress",
  "completed",
];

const statusIcons: Record<InstitutionResponseStatus, typeof CheckCircle2> = {
  acknowledged: CircleDot,
  committed: Clock,
  in_progress: Clock,
  completed: CheckCircle2,
};

const statusColors: Record<InstitutionResponseStatus, string> = {
  acknowledged: "#64748b",
  committed: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#84cc16",
};

export default function AccountabilityPage() {
  const responseCounts = {
    acknowledged: DEMO_INSTITUTIONAL_RESPONSES.filter(
      (r) => r.status === "acknowledged"
    ).length,
    committed: DEMO_INSTITUTIONAL_RESPONSES.filter(
      (r) => r.status === "committed"
    ).length,
    in_progress: DEMO_INSTITUTIONAL_RESPONSES.filter(
      (r) => r.status === "in_progress"
    ).length,
    completed: DEMO_INSTITUTIONAL_RESPONSES.filter(
      (r) => r.status === "completed"
    ).length,
  };

  const institutions = [
    ...new Set(DEMO_INSTITUTIONAL_RESPONSES.map((r) => r.institution)),
  ];

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
        <DemoNotice inline />
      </div>

      {/* How accountability works */}
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
        {statusOrder.map((status) => {
          const color = statusColors[status];
          const count = responseCounts[status];
          const labels: Record<InstitutionResponseStatus, string> = {
            acknowledged: "Acknowledged",
            committed: "Committed",
            in_progress: "In Progress",
            completed: "Completed",
          };

          return (
            <div
              key={status}
              className="glass rounded-xl p-4 text-center border border-white/7"
              style={{
                borderColor: `${color}20`,
                backgroundColor: `${color}08`,
              }}
            >
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color }}
              >
                {count}
              </p>
              <p className="text-xs text-civic-text-muted mt-1">
                {labels[status]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Institution list */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-civic-text mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-civic-text-muted" />
          Responding Institutions
        </h2>
        <div className="flex flex-wrap gap-2">
          {institutions.map((inst) => {
            const shortName = inst.split(" — ")[0] || inst;
            const responses = DEMO_INSTITUTIONAL_RESPONSES.filter(
              (r) => r.institution === inst
            );
            return (
              <div
                key={inst}
                className="glass rounded-lg px-3 py-2 border border-white/8 text-xs"
              >
                <span className="text-civic-text font-medium">{shortName}</span>
                <span className="text-civic-text-muted ml-1.5">
                  {responses.length} response{responses.length !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-xl font-bold text-civic-text mb-6">
          Response Timeline
        </h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-6 bottom-6 w-px bg-white/8" />

          <div className="space-y-6">
            {DEMO_INSTITUTIONAL_RESPONSES.map((response) => {
              const issue = DEMO_ISSUES.find((i) => i.id === response.issueId);
              const StatusIcon = statusIcons[response.status];
              const color = statusColors[response.status];

              return (
                <div key={response.id} className="relative pl-16">
                  {/* Timeline node */}
                  <div
                    className="absolute left-3.5 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: color,
                    }}
                  >
                    <StatusIcon
                      className="w-3 h-3"
                      style={{ color }}
                    />
                  </div>

                  {/* Card */}
                  <div className="glass rounded-2xl p-5 border border-white/7 hover:border-white/12 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={response.status} type="response" />
                          {issue && (
                            <CategoryBadge category={issue.category} size="sm" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-civic-cyan">
                          {response.institution}
                        </p>
                        {response.contactName && (
                          <p className="text-xs text-civic-text-muted">
                            {response.contactName}
                            {response.contactTitle && (
                              <> · {response.contactTitle}</>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-civic-text-muted">
                          <Calendar className="w-3 h-3" />
                          {formatDate(response.date)}
                        </div>
                        <p className="text-xs text-civic-text-muted mt-0.5">
                          {formatRelativeDate(response.date)}
                        </p>
                      </div>
                    </div>

                    {/* Issue reference */}
                    {response.issueTitle && (
                      <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 mb-3">
                        <span className="text-xs text-civic-text-muted">
                          In response to:
                        </span>
                        <Link
                          href={`/issues/${response.issueId}`}
                          className="text-xs text-civic-cyan hover:underline flex items-center gap-1 line-clamp-1"
                        >
                          {response.issueTitle}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </Link>
                      </div>
                    )}

                    <p className="text-sm text-civic-text-muted leading-relaxed">
                      {response.response}
                    </p>

                    {/* Commitment deadline */}
                    {response.commitmentDeadline && (
                      <div
                        className="flex items-center gap-2 mt-3 rounded-lg px-3 py-2"
                        style={{
                          backgroundColor: `${color}08`,
                          border: `1px solid ${color}20`,
                        }}
                      >
                        <Clock
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color }}
                        />
                        <p className="text-xs" style={{ color }}>
                          Commitment deadline:{" "}
                          <span className="font-semibold">
                            {formatDate(response.commitmentDeadline)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Open issues awaiting response */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-civic-text mb-4">
          Awaiting Institutional Response
        </h2>
        <p className="text-sm text-civic-text-muted mb-5">
          High-priority issues that have not yet received an institutional
          response. The community is watching.
        </p>
        <div className="space-y-3">
          {DEMO_ISSUES.filter(
            (issue) =>
              !DEMO_INSTITUTIONAL_RESPONSES.some(
                (r) => r.issueId === issue.id
              ) && issue.votes > 100
          )
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 4)
            .map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <div className="glass rounded-xl p-4 border border-white/7 hover:border-civic-red/15 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={issue.category} size="sm" />
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

      {/* CTA */}
      <div className="mt-10 glass rounded-2xl p-6 border border-civic-lime/15 text-center">
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
