import { notFound } from "next/navigation";
import { LiveVoteDisplay } from "@/components/shared/LiveVoteDisplay";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { getIssueById } from "@/app/actions/issues";
import type { Issue, IssueCategory } from "@/types";

export const dynamicParams = true;

export default async function LivePage({
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
    <LiveVoteDisplay
      issueId={issue.id}
      issueTitle={issue.title}
      issueDescription={issue.description}
      category={issue.category}
      locationName={issue.location.name}
      initialCount={issue.votes}
    />
  );
}
