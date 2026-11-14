"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export interface LiveMessage {
  id: string;
  issue_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(s: any) { return s; }

export async function postLiveMessage(
  issueId: string,
  content: string,
  authorName: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!hasSupabaseConfig()) return { success: false, error: "No database" };

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from("live_messages")
    .insert({
      issue_id: issueId,
      content: content.trim().slice(0, 200),
      author_name: authorName.trim() || "Anonymous",
      session_id: sessionId,
    }) as { error: { message: string } | null };

  if (error) return { success: false, error: error.message };
  return { success: true };
}
