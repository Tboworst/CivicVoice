export const revalidate = 300;

import {
  Layers,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Users,
  ShieldCheck,
  Bot,
  AlertCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { PriorityChart } from "@/components/charts/PriorityChart";
import {
  DEMO_ISSUES,
  DEMO_PROPOSALS,
  DEMO_INSTITUTIONAL_RESPONSES,
  DEMO_ACTIVITY_DATA,
  DEMO_CATEGORY_STATS,
} from "@/lib/demo-data";
import { getDashboardStats, getAreaStats } from "@/app/actions/geography";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const [stats, areaStats] = await Promise.all([
    getDashboardStats(),
    getAreaStats(),
  ]);

  const recentIssues = [...DEMO_ISSUES]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-civic-text">Admin Overview</h1>
          <p className="text-sm text-civic-text-muted">
            CivicVoice · Towson, MD
            {stats.fromDB && (
              <span className="ml-2 text-civic-cyan/70">· Live data</span>
            )}
          </p>
        </div>
        {!stats.fromDB && <DemoNotice inline />}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Issues"
          value={stats.totalIssues}
          icon={Layers}
          iconColor="#00d4ff"
        />
        <StatCard
          label="Community Votes"
          value={stats.totalVotes.toLocaleString()}
          icon={TrendingUp}
          iconColor="#3b82f6"
        />
        <StatCard
          label="Active Proposals"
          value={stats.activeProposals}
          icon={Lightbulb}
          iconColor="#84cc16"
        />
        <StatCard
          label="Resolved Issues"
          value={stats.resolvedIssues}
          icon={CheckCircle}
          iconColor="#84cc16"
        />
        <StatCard
          label="Engaged Residents"
          value={stats.fromDB ? "—" : "1,247"}
          icon={Users}
          iconColor="#a855f7"
        />
        <StatCard
          label="Institutional Responses"
          value={stats.institutionalResponses}
          icon={ShieldCheck}
          iconColor="#f59e0b"
        />
      </div>

      {/* Charts row — always uses demo chart data for visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/7">
          <h2 className="text-sm font-semibold text-civic-text mb-1">
            Platform Activity
          </h2>
          <p className="text-xs text-civic-text-muted mb-4">
            Issues, votes, and proposals — last 6 weeks
          </p>
          <ActivityChart data={DEMO_ACTIVITY_DATA} height={180} />
        </div>

        <div className="glass rounded-2xl p-5 border border-white/7">
          <h2 className="text-sm font-semibold text-civic-text mb-1">
            Issues by Category
          </h2>
          <p className="text-xs text-civic-text-muted mb-2">
            Submission breakdown
          </p>
          <CategoryPieChart data={DEMO_CATEGORY_STATS} height={220} />
        </div>
      </div>

      {/* Priority bar + recent issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 border border-white/7">
          <h2 className="text-sm font-semibold text-civic-text mb-1">
            Priority Rankings
          </h2>
          <p className="text-xs text-civic-text-muted mb-4">
            Votes per category
          </p>
          <PriorityChart data={DEMO_CATEGORY_STATS} height={220} />
        </div>

        <div className="glass rounded-2xl p-5 border border-white/7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-civic-text">
              Recent Submissions
            </h2>
            <Link
              href="/explore"
              className="text-xs text-civic-cyan hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-civic-elevated/50 hover:bg-white/5 transition-colors border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryBadge category={issue.category} size="sm" />
                    </div>
                    <p className="text-xs font-medium text-civic-text line-clamp-1">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-xs text-civic-text-muted">
                        <MapPin className="w-3 h-3" />
                        {issue.location.area || issue.location.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={issue.status} type="issue" />
                    <span className="text-xs text-civic-text-muted">
                      {formatRelativeDate(issue.submittedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Proposals & Accountability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 border border-white/7">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-civic-lime" />
            <h2 className="text-sm font-semibold text-civic-text">
              Proposal Status
            </h2>
          </div>
          <div className="space-y-3">
            {DEMO_PROPOSALS.map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-civic-elevated/50 border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={proposal.status} type="proposal" />
                    {proposal.aiGenerated && (
                      <span className="flex items-center gap-0.5 text-xs text-purple-400">
                        <Bot className="w-3 h-3" />
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-civic-text line-clamp-1">
                    {proposal.title}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-civic-lime">
                    {proposal.votes}
                  </p>
                  <p className="text-xs text-civic-text-muted">votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/7">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-civic-lime" />
            <h2 className="text-sm font-semibold text-civic-text">
              Institutional Responses
            </h2>
          </div>
          <div className="space-y-3">
            {DEMO_INSTITUTIONAL_RESPONSES.map((response) => {
              const statusIcons: Record<string, typeof AlertCircle> = {
                acknowledged: AlertCircle,
                committed: Clock,
                in_progress: Clock,
                completed: CheckCircle,
                pending: AlertCircle,
                resolved: CheckCircle,
                dismissed: AlertCircle,
              };
              const StatusIcon = statusIcons[response.status] ?? AlertCircle;
              const statusColors: Record<string, string> = {
                acknowledged: "#64748b",
                committed: "#3b82f6",
                in_progress: "#f59e0b",
                completed: "#84cc16",
                pending: "#64748b",
                resolved: "#84cc16",
                dismissed: "#ef4444",
              };
              const color = statusColors[response.status] ?? "#64748b";

              return (
                <div
                  key={response.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-civic-elevated/50 border border-white/5"
                >
                  <StatusIcon
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold line-clamp-1"
                      style={{ color }}
                    >
                      {response.institution.split(" — ")[0]}
                    </p>
                    <p className="text-xs text-civic-text-muted line-clamp-1 mt-0.5">
                      {response.issueTitle}
                    </p>
                  </div>
                  <StatusBadge status={response.status as "acknowledged"} type="response" />
                </div>
              );
            })}
          </div>
          <Link href="/accountability">
            <div className="mt-3 text-center text-xs text-civic-cyan hover:underline cursor-pointer">
              View full accountability tracker →
            </div>
          </Link>
        </div>
      </div>

      {/* Geographic distribution */}
      <div className="glass rounded-2xl p-5 border border-white/7">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-civic-cyan" />
          <h2 className="text-sm font-semibold text-civic-text">
            Geographic Issue Distribution
          </h2>
          {stats.fromDB && (
            <span className="text-xs text-civic-cyan/60 ml-auto">Live</span>
          )}
        </div>
        {areaStats.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {areaStats.slice(0, 10).map(({ area, count }) => {
              const intensity = Math.min(count / (areaStats[0]?.count || 1), 1);
              const color = `hsl(${195 + intensity * 40}, 80%, ${40 + intensity * 25}%)`;
              return (
                <div
                  key={area}
                  className="rounded-xl p-3 text-center"
                  style={{
                    backgroundColor: `${color}12`,
                    border: `1px solid ${color}22`,
                  }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {count}
                  </p>
                  <p className="text-xs text-civic-text-muted mt-1 leading-tight">
                    {area}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-civic-text-muted text-center py-4">
            No geographic data available.
          </p>
        )}
      </div>
    </div>
  );
}
