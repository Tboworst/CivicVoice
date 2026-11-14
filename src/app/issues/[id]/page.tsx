import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  MessageSquare,
  Calendar,
  Tag,
  ArrowLeft,
  User,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveVoteButton } from "@/components/shared/LiveVoteButton";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { IssueCard } from "@/components/shared/IssueCard";
import { RelatedIssuesWidget } from "@/components/shared/RelatedIssuesWidget";
import { MapWrapper } from "@/components/map/MapWrapper";
import {
  DEMO_ISSUES,
  DEMO_PROPOSALS,
  DEMO_INSTITUTIONAL_RESPONSES,
} from "@/lib/demo-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";

export function generateStaticParams() {
  return DEMO_ISSUES.map((issue) => ({ id: issue.id }));
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = DEMO_ISSUES.find((i) => i.id === id);
  if (!issue) notFound();

  const relatedIssues = DEMO_ISSUES.filter(
    (i) => i.id !== issue.id && i.category === issue.category
  ).slice(0, 3);

  const relatedProposals = DEMO_PROPOSALS.filter((p) =>
    p.relatedIssueIds.includes(issue.id)
  );

  const institutionalResponse = DEMO_INSTITUTIONAL_RESPONSES.find(
    (r) => r.issueId === issue.id
  );

  const statusProgress: Record<string, number> = {
    open: 10,
    under_review: 35,
    in_progress: 65,
    resolved: 100,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-civic-text-muted hover:text-civic-cyan transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore
      </Link>

      <DemoNotice className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue header */}
          <div className="glass rounded-2xl p-6 border border-white/7">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CategoryBadge category={issue.category} />
              <StatusBadge status={issue.status} type="issue" />
              {issue.reporterType && (
                <span className="inline-flex items-center gap-1 text-xs text-civic-text-muted bg-white/5 border border-white/8 rounded-full px-2 py-0.5">
                  <User className="w-3 h-3" />
                  {issue.reporterType.charAt(0).toUpperCase() +
                    issue.reporterType.slice(1)}{" "}
                  reporter
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-civic-text mb-4 leading-tight">
              {issue.title}
            </h1>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-civic-text-muted mb-1.5">
                <span>Progress</span>
                <span className="text-civic-cyan capitalize">
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${statusProgress[issue.status] ?? 0}%`,
                    backgroundColor:
                      issue.status === "resolved" ? "#84cc16" : "#00d4ff",
                  }}
                />
              </div>
            </div>

            <p className="text-civic-text-muted leading-relaxed">
              {issue.description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-white/7 text-xs text-civic-text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted {formatDate(issue.submittedAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {issue.location.name}
              </div>
              {issue.commentCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {issue.commentCount} comments
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {issue.tags.length > 0 && (
            <div className="glass rounded-2xl p-4 border border-white/7">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-civic-text-muted" />
                <h2 className="text-sm font-semibold text-civic-text">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-civic-text-muted bg-white/5 border border-white/8 rounded-full px-2.5 py-1"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="glass rounded-2xl overflow-hidden border border-white/7">
            <div className="p-4 border-b border-white/7">
              <h2 className="text-sm font-semibold text-civic-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-civic-cyan" />
                Location
              </h2>
            </div>
            <div className="h-56">
              <MapWrapper
                issues={[issue]}
                center={[issue.location.lng, issue.location.lat]}
                zoom={15}
                height="100%"
                interactive={true}
              />
            </div>
            <div className="p-3 bg-civic-elevated/50">
              <p className="text-xs text-civic-text-muted">
                <span className="text-civic-text font-medium">
                  {issue.location.name}
                </span>
                {issue.location.area && (
                  <span> · {issue.location.area}</span>
                )}
              </p>
            </div>
          </div>

          {/* Related proposals */}
          {relatedProposals.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/7">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-civic-lime" />
                <h2 className="text-base font-semibold text-civic-text">
                  Proposed Solutions
                </h2>
              </div>
              <div className="space-y-3">
                {relatedProposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href="/proposals"
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-civic-elevated/50 border border-white/7 hover:border-civic-lime/20 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-civic-text group-hover:text-civic-lime transition-colors line-clamp-1">
                        {proposal.title}
                      </p>
                      <p className="text-xs text-civic-text-muted mt-0.5 line-clamp-1">
                        {proposal.estimatedImpact}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-civic-lime text-sm font-semibold flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {proposal.votes}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI-detected related issues */}
          <RelatedIssuesWidget
            issueId={issue.id}
            title={issue.title}
            description={issue.description}
            location={issue.location.name}
            category={issue.category}
          />

          {/* Same-category issues */}
          {relatedIssues.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-civic-text mb-4">
                Related Issues
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedIssues.map((rel) => (
                  <IssueCard key={rel.id} issue={rel} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Vote card */}
          <div className="glass rounded-2xl p-5 border border-white/7">
            <h2 className="text-sm font-semibold text-civic-text mb-4">
              Community Support
            </h2>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-civic-cyan tabular-nums">
                {issue.votes}
              </p>
              <p className="text-xs text-civic-text-muted mt-1">
                community votes
              </p>
            </div>
            <LiveVoteButton
              issueId={issue.id}
              initialCount={issue.votes}
              className="w-full gap-2 mb-2"
            />
          </div>

          {/* Institutional response */}
          {institutionalResponse ? (
            <div className="glass rounded-2xl p-5 border border-white/7">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-civic-text">
                  Institutional Response
                </h2>
                <StatusBadge
                  status={institutionalResponse.status}
                  type="response"
                />
              </div>
              <p className="text-xs font-medium text-civic-cyan mb-1">
                {institutionalResponse.institution}
              </p>
              {institutionalResponse.contactName && (
                <p className="text-xs text-civic-text-muted mb-3">
                  {institutionalResponse.contactName}
                  {institutionalResponse.contactTitle && (
                    <>, {institutionalResponse.contactTitle}</>
                  )}
                </p>
              )}
              <p className="text-sm text-civic-text-muted leading-relaxed">
                {institutionalResponse.response}
              </p>
              <p className="text-xs text-civic-text-muted mt-3">
                {formatRelativeDate(institutionalResponse.date)}
              </p>
              <Link href="/accountability">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 gap-1.5 text-civic-lime hover:bg-civic-lime/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Accountability Tracker
                </Button>
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl p-5 border border-white/7">
              <h2 className="text-sm font-semibold text-civic-text mb-2">
                Institutional Response
              </h2>
              <p className="text-xs text-civic-text-muted">
                No institutional response has been recorded yet.
              </p>
              <Link href="/accountability">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-civic-cyan text-xs"
                >
                  View Accountability Tracker
                </Button>
              </Link>
            </div>
          )}

          {/* Issue metadata */}
          <div className="glass rounded-2xl p-5 border border-white/7">
            <h2 className="text-sm font-semibold text-civic-text mb-4">
              Issue Info
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-civic-text-muted">ID</span>
                <span className="text-civic-text font-mono">{issue.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-civic-text-muted">Submitted</span>
                <span className="text-civic-text">
                  {formatDate(issue.submittedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-civic-text-muted">Status</span>
                <span className="text-civic-text capitalize">
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-civic-text-muted">Category</span>
                <span className="text-civic-text capitalize">
                  {issue.category.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-civic-text-muted">Area</span>
                <span className="text-civic-text">
                  {issue.location.area || "Towson, MD"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
