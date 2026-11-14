import { cn } from "@/lib/utils";
import type { IssueStatus, ProposalStatus, InstitutionResponseStatus } from "@/types";

const issueStatusConfig: Record<
  IssueStatus,
  { label: string; className: string; dot: string }
> = {
  open: {
    label: "Open",
    className: "border-civic-cyan/30 bg-civic-cyan/10 text-civic-cyan",
    dot: "bg-civic-cyan",
  },
  under_review: {
    label: "Under Review",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400",
  },
  in_progress: {
    label: "In Progress",
    className: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400 animate-pulse",
  },
  resolved: {
    label: "Resolved",
    className: "border-civic-lime/30 bg-civic-lime/10 text-civic-lime",
    dot: "bg-civic-lime",
  },
};

const proposalStatusConfig: Record<
  ProposalStatus,
  { label: string; className: string; dot: string }
> = {
  proposed: {
    label: "Proposed",
    className: "border-civic-cyan/30 bg-civic-cyan/10 text-civic-cyan",
    dot: "bg-civic-cyan",
  },
  under_consideration: {
    label: "Under Consideration",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
  },
  approved: {
    label: "Approved",
    className: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },
  implemented: {
    label: "Implemented",
    className: "border-civic-lime/30 bg-civic-lime/10 text-civic-lime",
    dot: "bg-civic-lime",
  },
};

const responseStatusConfig: Record<
  InstitutionResponseStatus,
  { label: string; className: string; dot: string }
> = {
  acknowledged: {
    label: "Acknowledged",
    className: "border-white/20 bg-white/5 text-white/60",
    dot: "bg-white/40",
  },
  committed: {
    label: "Committed",
    className: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },
  in_progress: {
    label: "In Progress",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "border-civic-lime/30 bg-civic-lime/10 text-civic-lime",
    dot: "bg-civic-lime",
  },
};

interface StatusBadgeProps {
  status: IssueStatus | ProposalStatus | InstitutionResponseStatus;
  type?: "issue" | "proposal" | "response";
  className?: string;
}

export function StatusBadge({
  status,
  type = "issue",
  className,
}: StatusBadgeProps) {
  const config =
    type === "proposal"
      ? proposalStatusConfig[status as ProposalStatus]
      : type === "response"
      ? responseStatusConfig[status as InstitutionResponseStatus]
      : issueStatusConfig[status as IssueStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
