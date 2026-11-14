"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type IssueSupportInsert = Database["public"]["Tables"]["issue_support"]["Insert"];
type ProposalVoteInsert = Database["public"]["Tables"]["proposal_votes"]["Insert"];

export interface VoteResult {
  success: boolean;
  error?: string;
  newCount?: number;
  hasVoted?: boolean;
}

// Escape hatch for Supabase TypeScript 5.9 / supabase-js 2.119 inference issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) { return supabase; }

export async function voteForIssue(
  issueId: string,
  sessionId: string
): Promise<VoteResult> {
  if (!hasSupabaseConfig()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if already voted
  const orFilter = user
    ? `user_id.eq.${user.id},session_id.eq.${sessionId}`
    : `session_id.eq.${sessionId}`;

  const existing = await db(supabase)
    .from("issue_support")
    .select("id")
    .eq("issue_id", issueId)
    .or(orFilter)
    .maybeSingle() as { data: { id: string } | null; error: unknown };

  if (existing.data) {
    const { data: issue } = await db(supabase)
      .from("issues")
      .select("vote_count")
      .eq("id", issueId)
      .single() as { data: { vote_count: number } | null; error: unknown };
    return { success: true, newCount: issue?.vote_count ?? 0, hasVoted: true };
  }

  const payload: IssueSupportInsert = {
    issue_id: issueId,
    user_id: user?.id ?? null,
    session_id: user ? null : sessionId,
  };

  const { error } = await db(supabase)
    .from("issue_support")
    .insert(payload) as { data: unknown; error: { code?: string; message?: string } | null };

  if (error) {
    if (error.code === "23505") {
      const { data: issue } = await db(supabase)
        .from("issues")
        .select("vote_count")
        .eq("id", issueId)
        .single() as { data: { vote_count: number } | null; error: unknown };
      return { success: true, newCount: issue?.vote_count ?? 0, hasVoted: true };
    }
    return { success: false, error: error.message };
  }

  const { data: issue } = await db(supabase)
    .from("issues")
    .select("vote_count")
    .eq("id", issueId)
    .single() as { data: { vote_count: number } | null; error: unknown };

  revalidatePath(`/issues/${issueId}`);
  return { success: true, newCount: issue?.vote_count ?? 0, hasVoted: false };
}

export async function checkVotedIssue(
  issueId: string,
  sessionId: string
): Promise<boolean> {
  if (!hasSupabaseConfig()) return false;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const orFilter = user
    ? `user_id.eq.${user.id},session_id.eq.${sessionId}`
    : `session_id.eq.${sessionId}`;

  const { data } = await db(supabase)
    .from("issue_support")
    .select("id")
    .eq("issue_id", issueId)
    .or(orFilter)
    .maybeSingle() as { data: { id: string } | null; error: unknown };

  return Boolean(data);
}

export async function voteForProposal(
  proposalId: string,
  sessionId: string
): Promise<VoteResult> {
  if (!hasSupabaseConfig()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const orFilter = user
    ? `user_id.eq.${user.id},session_id.eq.${sessionId}`
    : `session_id.eq.${sessionId}`;

  const existing = await db(supabase)
    .from("proposal_votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .or(orFilter)
    .maybeSingle() as { data: { id: string } | null; error: unknown };

  if (existing.data) {
    const { data: proposal } = await db(supabase)
      .from("proposals")
      .select("vote_count")
      .eq("id", proposalId)
      .single() as { data: { vote_count: number } | null; error: unknown };
    return { success: true, newCount: proposal?.vote_count ?? 0, hasVoted: true };
  }

  const payload: ProposalVoteInsert = {
    proposal_id: proposalId,
    user_id: user?.id ?? null,
    session_id: user ? null : sessionId,
  };

  const { error } = await db(supabase)
    .from("proposal_votes")
    .insert(payload) as { data: unknown; error: { code?: string; message?: string } | null };

  if (error) {
    if (error.code === "23505") {
      const { data: proposal } = await db(supabase)
        .from("proposals")
        .select("vote_count")
        .eq("id", proposalId)
        .single() as { data: { vote_count: number } | null; error: unknown };
      return { success: true, newCount: proposal?.vote_count ?? 0, hasVoted: true };
    }
    return { success: false, error: error.message };
  }

  const { data: proposal } = await db(supabase)
    .from("proposals")
    .select("vote_count")
    .eq("id", proposalId)
    .single() as { data: { vote_count: number } | null; error: unknown };

  revalidatePath("/proposals");
  return { success: true, newCount: proposal?.vote_count ?? 0, hasVoted: false };
}
