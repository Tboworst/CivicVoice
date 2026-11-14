"use client";

import { useState, useEffect } from "react";
import { Send, Check, Loader2 } from "lucide-react";
import { postLiveMessage } from "@/app/actions/messages";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const SESSION_KEY = "civic_session_id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function LiveMessageInput({ issueId }: { issueId: string }) {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(getSessionId());
    const saved = localStorage.getItem("civic_display_name");
    if (saved) setName(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading || sent) return;
    setLoading(true);

    if (name.trim()) {
      localStorage.setItem("civic_display_name", name.trim());
    }

    if (hasSupabaseConfig()) {
      await postLiveMessage(issueId, content, name, sessionId);
    }

    setSent(true);
    setContent("");
    setLoading(false);
    // Allow sending again after 10s
    setTimeout(() => setSent(false), 10000);
  }

  return (
    <div className="glass rounded-2xl border border-white/7 p-4 mt-4">
      <p className="text-xs font-semibold text-civic-text mb-3">
        Share your thoughts — shown live on screen
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-civic-text placeholder:text-civic-text-muted/50 focus:outline-none focus:border-civic-cyan/40"
        />
        <div className="relative">
          <textarea
            placeholder="Write a comment… (max 200 chars)"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 200))}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-civic-text placeholder:text-civic-text-muted/50 focus:outline-none focus:border-civic-cyan/40 resize-none pr-10"
          />
          <span className="absolute bottom-2 right-3 text-xs text-civic-text-muted/40">
            {content.length}/200
          </span>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || loading || sent}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            sent
              ? "bg-civic-lime/20 text-civic-lime border border-civic-lime/30 cursor-default"
              : "bg-civic-cyan text-civic-bg hover:bg-civic-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : sent ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sent ? "Sent! Visible on screen" : "Send to Live Screen"}
        </button>
      </form>
    </div>
  );
}
