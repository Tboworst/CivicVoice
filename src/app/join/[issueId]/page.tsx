import { notFound } from "next/navigation";
import Link from "next/link";
import { Radio, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveVoteButton } from "@/components/shared/LiveVoteButton";
import { LiveMessageInput } from "@/components/shared/LiveMessageInput";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { getIssueById } from "@/app/actions/issues";
import type { Issue, IssueCategory } from "@/types";

export const dynamicParams = true;

export default async function JoinIssuePage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;

  let issue: Issue | null =
    DEMO_ISSUES.find((i) => i.id === issueId) ?? null;

  if (!issue) {
    const { data } = await getIssueById(issueId);
    if (data) {
      issue = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category as IssueCategory,
        status: data.status as Issue["status"],
        votes: data.vote_count,
        submittedAt: data.created_at,
        location: {
          name: data.location_name,
          lat: data.location_lat,
          lng: data.location_lng,
          area: data.location_area ?? undefined,
        },
        tags: data.tags,
        imageUrl: data.image_url ?? undefined,
        commentCount: data.comment_count,
        reporterType:
          (data.reporter_type as Issue["reporterType"]) ?? undefined,
      };
    }
  }

  if (!issue) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-civic-bg">
      {/* Minimal header */}
      <header className="sticky top-0 z-10 glass border-b border-white/7 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-civic-cyan/20 border border-civic-cyan/40 flex items-center justify-center">
            <Radio className="w-3 h-3 text-civic-cyan" />
          </div>
          <span className="font-bold text-sm text-civic-text">CivicVoice</span>
        </div>
        <Link
          href={`/issues/${issueId}`}
          className="text-xs text-civic-text-muted hover:text-civic-cyan flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Full details
        </Link>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Live indicator */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-civic-cyan/10 border border-civic-cyan/20 text-civic-cyan text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-cyan animate-pulse" />
            Live voting open
          </div>
        </div>

        {/* Issue card */}
        <div className="glass rounded-2xl border border-white/7 overflow-hidden mb-5">
          {issue.imageUrl && (
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-44 object-cover"
            />
          )}
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <CategoryBadge category={issue.category} />
              <StatusBadge status={issue.status} type="issue" />
            </div>
            <h2 className="text-base font-bold text-civic-text leading-snug mb-2">
              {issue.title}
            </h2>
            <p className="text-sm text-civic-text-muted leading-relaxed mb-3 line-clamp-4">
              {issue.description}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-civic-text-muted">
              <MapPin className="w-3.5 h-3.5" />
              {issue.location.name}
              {issue.location.area && (
                <span className="text-civic-text-muted/60">
                  · {issue.location.area}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vote button — LiveVoteButton has Realtime built in */}
        <LiveVoteButton
          issueId={issue.id}
          initialCount={issue.votes}
          className="w-full gap-2 py-5 text-base"
        />

        <p className="text-center text-xs text-civic-text-muted mt-3">
          No sign-in required · One vote per device · Updates in real-time
        </p>

        {/* Live comment input */}
        <LiveMessageInput issueId={issue.id} />

        {/* Footer links */}
        <div className="mt-8 glass rounded-2xl p-4 text-center border border-white/7 space-y-2">
          <p className="text-xs text-civic-text-muted">
            Want to report an issue in your community?
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link
              href="/submit"
              className="text-civic-cyan hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Submit an issue
            </Link>
            <Link
              href="/explore"
              className="text-civic-text-muted hover:text-civic-cyan transition-colors"
            >
              Browse all issues
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
