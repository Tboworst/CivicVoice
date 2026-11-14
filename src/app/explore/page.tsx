"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  Map,
  List,
  X,
  Filter,
  MapPin,
  TrendingUp,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueCard } from "@/components/shared/IssueCard";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { DEMO_ISSUES } from "@/lib/demo-data";
import { CATEGORY_LABELS } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import type { Issue, IssueStatus } from "@/types";

const CivicMap = dynamic(() => import("@/components/map/CivicMap"), {
  ssr: false,
  loading: () => <MapSkeleton className="w-full h-full" />,
});

const categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const statuses: { value: IssueStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export default function ExplorePage() {
  const [view, setView] = useState<"map" | "list">("map");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filtered = useMemo(() => {
    return DEMO_ISSUES.filter((issue) => {
      const matchSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.description.toLowerCase().includes(search.toLowerCase()) ||
        issue.location.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || issue.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" || issue.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="glass border-b border-white/7 px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-civic-text-muted" />
          <Input
            placeholder="Search issues, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-civic-text-muted hover:text-civic-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-9">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-civic-text-muted" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-civic-text-muted mr-2">
            {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                view === "map"
                  ? "bg-civic-cyan/15 text-civic-cyan"
                  : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Map
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-white/10 ${
                view === "list"
                  ? "bg-civic-cyan/15 text-civic-cyan"
                  : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-hidden relative">
        {view === "map" ? (
          <div className="h-full flex">
            {/* Map */}
            <div className={`relative transition-all duration-300 ${selectedIssue ? "flex-1" : "w-full"}`}>
              <CivicMap
                issues={filtered}
                center={[-76.6025, 39.3959]}
                zoom={13}
                height="100%"
                className="w-full h-full"
                onIssueClick={setSelectedIssue}
                selectedIssueId={selectedIssue?.id}
              />

              {/* Issue count badge */}
              <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2 border border-white/10 text-xs">
                <span className="text-civic-cyan font-semibold">{filtered.length}</span>
                <span className="text-civic-text-muted ml-1">
                  issue{filtered.length !== 1 ? "s" : ""} on map
                </span>
              </div>

              <div className="absolute bottom-4 left-4">
                <DemoNotice inline />
              </div>
            </div>

            {/* Issue detail side panel */}
            {selectedIssue && (
              <div className="w-96 glass border-l border-white/7 overflow-y-auto flex flex-col animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-white/7">
                  <span className="text-sm font-semibold text-civic-text">Issue Details</span>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="p-1 rounded-lg text-civic-text-muted hover:text-civic-text hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <CategoryBadge category={selectedIssue.category} />
                    <StatusBadge status={selectedIssue.status} type="issue" />
                  </div>

                  <h2 className="text-base font-bold text-civic-text mb-2 leading-tight">
                    {selectedIssue.title}
                  </h2>

                  <p className="text-sm text-civic-text-muted leading-relaxed mb-4">
                    {selectedIssue.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="glass rounded-lg p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-civic-cyan font-bold text-lg">
                        <TrendingUp className="w-4 h-4" />
                        {selectedIssue.votes}
                      </div>
                      <p className="text-xs text-civic-text-muted">votes</p>
                    </div>
                    <div className="glass rounded-lg p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400 font-bold text-lg">
                        <MessageSquare className="w-4 h-4" />
                        {selectedIssue.commentCount ?? 0}
                      </div>
                      <p className="text-xs text-civic-text-muted">comments</p>
                    </div>
                    <div className="glass rounded-lg p-2.5 text-center">
                      <div className="text-purple-400 font-bold text-xs mt-1 capitalize">
                        {selectedIssue.reporterType ?? "community"}
                      </div>
                      <p className="text-xs text-civic-text-muted mt-0.5">reporter</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 glass rounded-lg p-3 mb-4">
                    <MapPin className="w-4 h-4 text-civic-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-civic-text">
                        {selectedIssue.location.name}
                      </p>
                      {selectedIssue.location.area && (
                        <p className="text-xs text-civic-text-muted">
                          {selectedIssue.location.area}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedIssue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedIssue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-civic-text-muted bg-white/5 border border-white/8 rounded-full px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-civic-text-muted mb-4">
                    Submitted {formatRelativeDate(selectedIssue.submittedAt)}
                  </p>
                </div>

                <div className="p-4 border-t border-white/7">
                  <Link href={`/issues/${selectedIssue.id}`}>
                    <Button className="w-full gap-2">
                      View Full Issue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <DemoNotice className="mb-4" />
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-civic-text-muted mx-auto mb-3" />
                  <p className="text-civic-text-muted">No issues match your filters.</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="text-civic-cyan text-sm mt-2 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
