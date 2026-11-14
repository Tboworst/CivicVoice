import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Lightbulb,
  ShieldCheck,
  MapPin,
  PlusCircle,
  ChevronRight,
  Layers,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/shared/IssueCard";
import { StatCard } from "@/components/shared/StatCard";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { PriorityChart } from "@/components/charts/PriorityChart";
import { MapWrapper } from "@/components/map/MapWrapper";
import { getTrendingIssues } from "@/app/actions/geography";
import {
  DEMO_ISSUES,
  DEMO_PLATFORM_STATS,
  DEMO_CATEGORY_STATS,
  DEMO_PROPOSALS,
} from "@/lib/demo-data";

export const revalidate = 300; // cache page for 5 minutes

export default async function HomePage() {
  const trendingIssues = await getTrendingIssues(3);
  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Background glow */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

        {/* Floating map card */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
          <div className="w-full max-w-5xl h-[600px] rounded-3xl overflow-hidden">
            <MapWrapper
              issues={DEMO_ISSUES}
              center={[-76.6025, 39.3959]}
              zoom={13}
              height="100%"
              interactive={false}
            />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 border border-civic-cyan/20">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-cyan animate-pulse" />
            <span className="text-xs text-civic-cyan font-medium tracking-wide">
              Towson, Maryland · Community Intelligence Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-civic-text leading-tight mb-6">
            Your community.
            <br />
            <span className="text-civic-cyan text-glow-cyan">Your voice.</span>
            <br />
            Your impact.
          </h1>

          <p className="text-lg sm:text-xl text-civic-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            CivicVoice brings Towson together — from TU students to Towson
            residents. Submit issues, vote on priorities, and track how
            institutions respond.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="gap-2 shadow-glow-cyan">
                <Layers className="w-4 h-4" />
                Explore the Map
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/submit">
              <Button variant="secondary" size="lg" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Submit an Issue
              </Button>
            </Link>
          </div>

          {/* Quick stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {[
              { value: DEMO_PLATFORM_STATS.totalIssues, label: "issues tracked" },
              { value: DEMO_PLATFORM_STATS.totalVotes.toLocaleString(), label: "community votes" },
              { value: DEMO_PLATFORM_STATS.activeProposals, label: "active proposals" },
              { value: DEMO_PLATFORM_STATS.institutionalResponses, label: "institutional responses" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-civic-cyan tabular-nums">{value}</p>
                <p className="text-xs text-civic-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-civic-cyan" />
          <div className="w-1 h-1 rounded-full bg-civic-cyan" />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-civic-text">Platform Overview</h2>
          <DemoNotice inline />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Issues Submitted"
            value={DEMO_PLATFORM_STATS.totalIssues}
            icon={Layers}
            trend={{ value: 23, label: "this month" }}
            iconColor="#00d4ff"
          />
          <StatCard
            label="Community Votes"
            value={DEMO_PLATFORM_STATS.totalVotes.toLocaleString()}
            icon={TrendingUp}
            trend={{ value: 18, label: "this week" }}
            iconColor="#3b82f6"
          />
          <StatCard
            label="Active Proposals"
            value={DEMO_PLATFORM_STATS.activeProposals}
            icon={Lightbulb}
            iconColor="#84cc16"
          />
          <StatCard
            label="Residents Engaged"
            value={DEMO_PLATFORM_STATS.participatingResidents}
            icon={Users}
            trend={{ value: 12, label: "this month" }}
            iconColor="#a855f7"
          />
        </div>
      </section>

      {/* ── Map + Priorities ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map preview */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-civic-text">
                Community Map
              </h2>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="gap-1 text-civic-cyan text-xs">
                  Explore full map
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="glass rounded-2xl overflow-hidden border border-white/7 h-[400px]">
              <MapWrapper
                issues={DEMO_ISSUES}
                center={[-76.6025, 39.3959]}
                zoom={13}
                height="100%"
                className="rounded-2xl"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["infrastructure", "safety", "transit", "campus", "housing"].map(
                (cat) => (
                  <CategoryBadge key={cat} category={cat as never} size="sm" />
                )
              )}
              <span className="text-xs text-civic-text-muted self-center">
                +3 more categories
              </span>
            </div>
          </div>

          {/* Priority chart */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-civic-text">
                Community Priorities
              </h2>
              <Link href="/priorities">
                <Button variant="ghost" size="sm" className="gap-1 text-civic-cyan text-xs">
                  Full rankings
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/7 h-[400px] flex flex-col">
              <p className="text-xs text-civic-text-muted mb-4">
                Issues ranked by community vote count
              </p>
              <div className="flex-1 min-h-0">
                <PriorityChart data={DEMO_CATEGORY_STATS} height={320} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Issues ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-civic-cyan" />
              <h2 className="text-xl font-bold text-civic-text">Trending Now</h2>
            </div>
            <p className="text-sm text-civic-text-muted">
              Issues gaining the most community support right now
            </p>
          </div>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="gap-1.5">
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingIssues.map((issue, i) => (
            <div key={issue.id} className="relative">
              {i === 0 && (
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 bg-civic-cyan text-civic-bg text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Flame className="w-2.5 h-2.5" /> #1 Trending
                </div>
              )}
              <IssueCard issue={issue} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Active Proposals ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-civic-text">
              Active Proposals
            </h2>
            <p className="text-sm text-civic-text-muted mt-1">
              Community-driven solutions gaining momentum
            </p>
          </div>
          <Link href="/proposals">
            <Button variant="outline" size="sm" className="gap-1.5">
              All proposals
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_PROPOSALS.slice(0, 3).map((proposal) => (
            <div key={proposal.id} className="glass rounded-xl p-4 border border-white/7 hover:border-civic-cyan/15 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <CategoryBadge category={proposal.category} size="sm" />
                <div className="flex items-center gap-1 text-civic-lime text-sm font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {proposal.votes}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-civic-text leading-tight mb-2 line-clamp-2">
                {proposal.title}
              </h3>
              <p className="text-xs text-civic-text-muted line-clamp-2 mb-3">
                {proposal.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-civic-text-muted">
                  {proposal.relatedIssueIds.length} related issue{proposal.relatedIssueIds.length !== 1 ? "s" : ""}
                </span>
                {proposal.aiGenerated && (
                  <span className="text-xs text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full px-2 py-0.5">
                    AI-assisted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accountability snapshot ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="glass rounded-2xl p-6 border border-white/7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-civic-lime" />
                <h2 className="text-xl font-bold text-civic-text">
                  Accountability Tracker
                </h2>
              </div>
              <p className="text-sm text-civic-text-muted max-w-xl">
                Tracking how Towson University, Baltimore County, and MTA Maryland
                respond to community concerns. Every commitment is documented.
              </p>
            </div>
            <Link href="/accountability">
              <Button variant="outline" className="gap-2 border-civic-lime/30 text-civic-lime hover:bg-civic-lime/10">
                View all responses
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Acknowledged", count: 2, color: "#64748b" },
              { label: "Committed", count: 1, color: "#3b82f6" },
              { label: "In Progress", count: 1, color: "#f59e0b" },
              { label: "Completed", count: 1, color: "#84cc16" },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20` }}
              >
                <p className="text-2xl font-bold" style={{ color }}>
                  {count}
                </p>
                <p className="text-xs text-civic-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div
          className="relative rounded-2xl overflow-hidden p-8 sm:p-12 text-center"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,100,200,0.15) 0%, rgba(5,8,15,0.8) 60%)",
            border: "1px solid rgba(0,212,255,0.12)",
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-civic-text mb-4">
              Every voice matters.
              <br />
              <span className="text-civic-cyan">Make yours heard.</span>
            </h2>
            <p className="text-lg text-civic-text-muted max-w-xl mx-auto mb-8">
              Join hundreds of Towson students and residents shaping the
              community conversation. Submit an issue, vote on priorities,
              or support a proposal — in under two minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/submit">
                <Button size="lg" className="gap-2 shadow-glow-cyan">
                  <MapPin className="w-4 h-4" />
                  Submit an Issue
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Explore the Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
