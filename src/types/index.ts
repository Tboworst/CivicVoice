export type IssueCategory =
  | "infrastructure"
  | "safety"
  | "transit"
  | "environment"
  | "housing"
  | "campus"
  | "accessibility"
  | "community";

export type IssueStatus =
  | "open"
  | "under_review"
  | "in_progress"
  | "resolved";

export type ProposalStatus =
  | "proposed"
  | "under_consideration"
  | "approved"
  | "implemented";

export type InstitutionResponseStatus =
  | "acknowledged"
  | "committed"
  | "in_progress"
  | "completed";

export interface IssueLocation {
  name: string;
  lat: number;
  lng: number;
  area?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  votes: number;
  submittedAt: string;
  location: IssueLocation;
  tags: string[];
  imageUrl?: string;
  commentCount?: number;
  reporterType?: "student" | "resident" | "faculty" | "visitor";
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: ProposalStatus;
  votes: number;
  relatedIssueIds: string[];
  estimatedImpact: string;
  createdAt: string;
  aiGenerated?: boolean;
  implementingBody?: string;
}

export interface InstitutionalResponse {
  id: string;
  institution: string;
  issueId: string;
  issueTitle?: string;
  response: string;
  status: InstitutionResponseStatus;
  date: string;
  contactName?: string;
  contactTitle?: string;
  commitmentDeadline?: string;
}

export interface CategoryStat {
  category: IssueCategory;
  count: number;
  percentage: number;
  change?: number;
}

export interface ActivityDataPoint {
  date: string;
  issues: number;
  votes: number;
  proposals: number;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  infrastructure: "Infrastructure",
  safety: "Safety",
  transit: "Transit",
  environment: "Environment",
  housing: "Housing",
  campus: "Campus Life",
  accessibility: "Accessibility",
  community: "Community",
};

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  infrastructure: "#3b82f6",
  safety: "#ef4444",
  transit: "#f59e0b",
  environment: "#22c55e",
  housing: "#a855f7",
  campus: "#00d4ff",
  accessibility: "#ec4899",
  community: "#84cc16",
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: "Open",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  proposed: "Proposed",
  under_consideration: "Under Consideration",
  approved: "Approved",
  implemented: "Implemented",
};
