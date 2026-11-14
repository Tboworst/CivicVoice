"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { CATEGORY_COLORS } from "@/types";
import type { IssueCategory } from "@/types";
import type { LiveMessage } from "@/app/actions/messages";

interface LiveVoteDisplayProps {
  issueId: string;
  issueTitle: string;
  issueDescription: string;
  category: IssueCategory;
  locationName: string;
  initialCount: number;
}

export function LiveVoteDisplay({
  issueId,
  issueTitle,
  issueDescription,
  category,
  locationName,
  initialCount,
}: LiveVoteDisplayProps) {
  const [count, setCount] = useState(initialCount);
  const [bump, setBump] = useState(false);
  const [recentVotes, setRecentVotes] = useState(0);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [url, setUrl] = useState("");
  const prevCount = useRef(initialCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const color = CATEGORY_COLORS[category] || "#00d4ff";

  useEffect(() => {
    setUrl(`${window.location.origin}/join/${issueId}`);
  }, [issueId]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function triggerBump(newCount: number) {
    const diff = newCount - prevCount.current;
    if (diff <= 0) return;
    prevCount.current = newCount;
    setCount(newCount);
    setRecentVotes((v) => v + diff);
    setBump(true);
    setTimeout(() => setBump(false), 700);
  }

  // Supabase Realtime + polling fallback for vote count
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const supabase = createClient();

    // Realtime for instant updates
    const channel = supabase
      .channel(`live-display-${issueId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "issues", filter: `id=eq.${issueId}` },
        (payload) => {
          const newCount = (payload.new as { vote_count?: number }).vote_count;
          if (typeof newCount === "number") triggerBump(newCount);
        }
      )
      .subscribe();

    // Polling fallback every 4s in case Realtime is not enabled
    const poll = setInterval(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("issues")
        .select("vote_count")
        .eq("id", issueId)
        .single() as { data: { vote_count: number } | null };
      if (data?.vote_count !== undefined) triggerBump(data.vote_count);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [issueId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime for live messages
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const supabase = createClient();

    // Load recent messages on mount
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("live_messages")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }: { data: LiveMessage[] | null }) => {
        if (data) setMessages(data.reverse());
      });

    // Subscribe to new messages
    const channel = supabase
      .channel(`live-messages-${issueId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages", filter: `issue_id=eq.${issueId}` },
        (payload) => {
          setMessages((prev) => [...prev.slice(-19), payload.new as LiveMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [issueId]);

  return (
    <div
      className="min-h-screen flex flex-col items-stretch relative overflow-hidden"
      style={{ background: "#05080f" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full blur-[140px] opacity-10 pointer-events-none transition-all duration-700"
        style={{
          width: 700, height: 700,
          background: color,
          top: "50%", left: "30%",
          transform: `translate(-50%,-50%) scale(${bump ? 1.4 : 1})`,
        }}
      />

      <div className="relative z-10 flex-1 grid grid-cols-[1fr_320px] gap-0">

        {/* ── Left: issue + vote count ──────────────────────────────── */}
        <div className="flex flex-col justify-center px-14 py-12">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color }} />
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color }}>
              Live voting open
            </span>
          </div>

          <div className="mb-4">
            <CategoryBadge category={category} />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-3 max-w-2xl">
            {issueTitle}
          </h1>
          <p className="text-lg text-white/45 mb-2 max-w-xl leading-relaxed line-clamp-2">
            {issueDescription}
          </p>
          <p className="text-sm text-white/25 mb-10">{locationName}</p>

          {/* Big vote number */}
          <div
            className="text-[9rem] xl:text-[11rem] font-black tabular-nums leading-none transition-all duration-300 select-none"
            style={{
              color,
              transform: bump ? "scale(1.07)" : "scale(1)",
              filter: bump
                ? `drop-shadow(0 0 50px ${color})`
                : `drop-shadow(0 0 12px ${color}44)`,
            }}
          >
            {count.toLocaleString()}
          </div>
          <p className="text-xl text-white/35 mt-2 tracking-wide">community votes</p>

          {recentVotes > 0 && (
            <div
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold w-fit"
              style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
              +{recentVotes} new {recentVotes === 1 ? "vote" : "votes"} this session
            </div>
          )}
        </div>

        {/* ── Right: QR + live messages ─────────────────────────────── */}
        <div
          className="flex flex-col border-l py-10 px-6 gap-6"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {/* QR code */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-white/35 tracking-widest uppercase font-medium">
              Scan to vote
            </p>
            <div
              className="p-3.5 rounded-2xl"
              style={{ background: "white", boxShadow: `0 0 30px ${color}44` }}
            >
              {url ? (
                <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#05080f" level="M" />
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded" />
              )}
            </div>
            <p className="text-xs text-white/20 text-center leading-relaxed">
              No sign-in · one vote per device
            </p>
          </div>

          {/* Live message feed */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-civic-lime animate-pulse" />
              <p className="text-xs text-white/35 tracking-widest uppercase font-medium">
                Live comments
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 320 }}>
              {messages.length === 0 ? (
                <p className="text-xs text-white/20 italic text-center mt-4">
                  No comments yet — share your thoughts after voting
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl px-3 py-2.5 animate-fade-in"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <p className="text-xs font-semibold text-white/60 mb-0.5">
                      {msg.author_name}
                    </p>
                    <p className="text-sm text-white/85 leading-snug break-words">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="relative z-10 px-10 py-3 flex items-center justify-between border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/25 font-medium tracking-wide">
            CivicVoice · Towson, MD
          </span>
        </div>
        <span className="text-xs text-white/15 font-mono">{url}</span>
      </div>
    </div>
  );
}
