import Link from "next/link";
import { MapPin, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";
import type { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
  className?: string;
  compact?: boolean;
}

export function IssueCard({ issue, className, compact = false }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`} className="block group">
      <article
        className={cn(
          "glass rounded-xl p-4 transition-all duration-200",
          "hover:border-civic-cyan/20 hover:bg-civic-elevated/80 hover:shadow-glass",
          "cursor-pointer",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} type="issue" />
          </div>
          <div className="flex items-center gap-1 text-civic-cyan text-sm font-semibold flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{issue.votes}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-semibold text-civic-text group-hover:text-civic-cyan transition-colors leading-tight",
            compact ? "text-sm line-clamp-2" : "text-base line-clamp-2 mb-2"
          )}
        >
          {issue.title}
        </h3>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-civic-text-muted line-clamp-2 mb-3">
            {issue.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-civic-text-muted text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[140px]">{issue.location.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {issue.commentCount !== undefined && (
              <div className="flex items-center gap-1 text-civic-text-muted text-xs">
                <MessageSquare className="w-3 h-3" />
                <span>{issue.commentCount}</span>
              </div>
            )}
            <span className="text-civic-text-muted text-xs">
              {formatRelativeDate(issue.submittedAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
