"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { voteForIssue } from "@/app/actions/votes";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const SESSION_KEY = "civic_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface LiveVoteButtonProps {
  issueId: string;
  initialCount: number;
  initialVoted?: boolean;
  className?: string;
}

export function LiveVoteButton({
  issueId,
  initialCount,
  initialVoted = false,
  className,
}: LiveVoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // Check localStorage for pre-existing vote flag (fast client-side check)
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    const key = `voted_issue_${issueId}`;
    if (localStorage.getItem(key) === "1") setVoted(true);
  }, [issueId]);

  // Subscribe to Realtime vote_count updates
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`issue-votes-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "issues",
          filter: `id=eq.${issueId}`,
        },
        (payload) => {
          const newCount = (payload.new as { vote_count?: number }).vote_count;
          if (typeof newCount === "number") setCount(newCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [issueId]);

  const handleVote = useCallback(async () => {
    if (voted || loading || !sessionId) return;
    setLoading(true);

    if (!hasSupabaseConfig()) {
      // Optimistic local-only vote for demo mode
      setCount((c) => c + 1);
      setVoted(true);
      localStorage.setItem(`voted_issue_${issueId}`, "1");
      setLoading(false);
      return;
    }

    const result = await voteForIssue(issueId, sessionId);
    if (result.success) {
      if (!result.hasVoted) {
        // Fresh vote — optimistically already reflected via Realtime,
        // but set count from server just in case
        if (typeof result.newCount === "number") setCount(result.newCount);
      }
      setVoted(true);
      localStorage.setItem(`voted_issue_${issueId}`, "1");
    }
    setLoading(false);
  }, [voted, loading, sessionId, issueId]);

  return (
    <Button
      onClick={handleVote}
      disabled={voted || loading}
      variant={voted ? "secondary" : "default"}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : voted ? (
        <Check className="w-4 h-4" />
      ) : (
        <TrendingUp className="w-4 h-4" />
      )}
      {voted ? "Supported" : "Support This Issue"}
      <span className="ml-1 tabular-nums font-semibold">{count}</span>
    </Button>
  );
}
