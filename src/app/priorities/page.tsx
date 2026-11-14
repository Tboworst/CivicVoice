import {
  TrendingUp,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { Progress } from "@/components/ui/progress";
import { IssueCard } from "@/components/shared/IssueCard";
import { PriorityChart } from "@/components/charts/PriorityChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import {
  DEMO_CATEGORY_STATS,
  DEMO_ISSUES,
  DEMO_ACTIVITY_DATA,
  DEMO_PLATFORM_STATS,
} from "@/lib/demo-data";
import { CATEGORY_COLORS } from "@/types";

const sortedCategories = [...DEMO_CATEGORY_STATS].sort(
  (a, b) => b.count - a.count
);

const maxVotes = sortedCategories[0]?.count ?? 1;

const topIssues = [...DEMO_ISSUES]
  .sort((a, b) => b.votes - a.votes)
  .slice(0, 6);

export default function PrioritiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-civic-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-civic-cyan" />
            Community Priorities
          </h1>
          <p className="text-civic-text-muted mt-1">
            What Towson cares about most, ranked by community voting.
            Data as of {DEMO_PLATFORM_STATS.dataAsOf}.
          </p>
        </div>
        <DemoNotice inline />
      </div>

      {/* Overview row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Issues", value: DEMO_PLATFORM_STATS.totalIssues, color: "#00d4ff" },
          { label: "Total Votes Cast", value: DEMO_PLATFORM_STATS.totalVotes.toLocaleString(), color: "#3b82f6" },
          { label: "Active Proposals", value: DEMO_PLATFORM_STATS.activeProposals, color: "#84cc16" },
          { label: "Residents Engaged", value: DEMO_PLATFORM_STATS.participatingResidents, color: "#a855f7" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="glass rounded-xl p-4 text-center border border-white/7"
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color }}>
              {value}
            </p>
            <p className="text-xs text-civic-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Horizontal bar chart */}
        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-white/7">
          <h2 className="text-base font-semibold text-civic-text mb-1">
            Issues by Category
          </h2>
          <p className="text-xs text-civic-text-muted mb-4">
            Total votes per category
          </p>
          <PriorityChart data={DEMO_CATEGORY_STATS} height={260} />
        </div>

        {/* Pie chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/7">
          <h2 className="text-base font-semibold text-civic-text mb-1">
            Category Distribution
          </h2>
          <p className="text-xs text-civic-text-muted mb-2">
            Proportion of total submissions
          </p>
          <CategoryPieChart data={DEMO_CATEGORY_STATS} height={260} />
        </div>
      </div>

      {/* Activity chart */}
      <div className="glass rounded-2xl p-5 border border-white/7 mb-8">
        <h2 className="text-base font-semibold text-civic-text mb-1">
          Platform Activity
        </h2>
        <p className="text-xs text-civic-text-muted mb-4">
          Issues, votes, and proposals over time — October to November 2024
        </p>
        <ActivityChart data={DEMO_ACTIVITY_DATA} height={180} />
      </div>

      {/* Ranked list */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-civic-text mb-4">
          Priority Rankings
        </h2>
        <div className="space-y-3">
          {sortedCategories.map((stat, index) => {
            const color = CATEGORY_COLORS[stat.category];
            const trend = stat.change ?? 0;

            return (
              <div
                key={stat.category}
                className="glass rounded-xl p-4 border border-white/7 hover:border-white/12 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}30`,
                      color,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Category info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CategoryBadge category={stat.category} size="sm" />
                      {trend !== 0 && (
                        <span
                          className={`flex items-center gap-0.5 text-xs ${
                            trend > 0 ? "text-civic-lime" : "text-civic-red"
                          }`}
                        >
                          {trend > 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {Math.abs(trend)}%
                        </span>
                      )}
                      {trend === 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-civic-text-muted">
                          <Minus className="w-3 h-3" />
                          Stable
                        </span>
                      )}
                    </div>
                    <Progress
                      value={(stat.count / maxVotes) * 100}
                      indicatorColor={color}
                      className="h-1.5"
                    />
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-lg font-bold tabular-nums"
                      style={{ color }}
                    >
                      {stat.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-civic-text-muted">
                      {stat.percentage}% of votes
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Issues */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-civic-cyan" />
          <h2 className="text-xl font-bold text-civic-text">
            Top Issues by Votes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topIssues.map((issue, i) => (
            <div key={issue.id} className="relative">
              {i < 3 && (
                <div
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 border"
                  style={{
                    backgroundColor:
                      i === 0
                        ? "rgba(255,215,0,0.15)"
                        : i === 1
                        ? "rgba(192,192,192,0.15)"
                        : "rgba(205,127,50,0.15)",
                    borderColor:
                      i === 0
                        ? "rgba(255,215,0,0.4)"
                        : i === 1
                        ? "rgba(192,192,192,0.4)"
                        : "rgba(205,127,50,0.4)",
                    color:
                      i === 0
                        ? "#ffd700"
                        : i === 1
                        ? "#c0c0c0"
                        : "#cd7f32",
                  }}
                >
                  {i + 1}
                </div>
              )}
              <IssueCard issue={issue} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
