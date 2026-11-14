// Auto-generated types for the CivicVoice database schema.
// Re-generate with: npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Row types (what comes back from SELECT) ──────────────────────────
interface ProfileRow {
  id: string; display_name: string | null; avatar_url: string | null;
  affiliation: string | null; is_admin: boolean; created_at: string; updated_at: string;
}
interface IssueRow {
  id: string; title: string; description: string; category: string;
  status: "open" | "under_review" | "in_progress" | "resolved";
  reporter_id: string | null; reporter_type: string | null;
  location_name: string; location_area: string | null;
  location_lat: number; location_lng: number; location_geo: unknown;
  tags: string[]; image_url: string | null;
  vote_count: number; comment_count: number; is_demo: boolean;
  created_at: string; updated_at: string;
}
interface IssueSupportRow {
  id: string; issue_id: string; user_id: string | null; session_id: string | null; created_at: string;
}
interface ProposalRow {
  id: string; title: string; description: string; related_issue_ids: string[];
  proposer_id: string | null; estimated_cost: string | null; estimated_impact: string | null;
  status: "proposed" | "under_review" | "approved" | "rejected" | "implemented";
  vote_count: number; is_ai_generated: boolean; is_demo: boolean; created_at: string; updated_at: string;
}
interface ProposalVoteRow {
  id: string; proposal_id: string; user_id: string | null; session_id: string | null; created_at: string;
}
interface InstitutionRow {
  id: string; name: string; type: string; website: string | null; logo_url: string | null; is_demo: boolean; created_at: string;
}
interface InstitutionalResponseRow {
  id: string; issue_id: string; institution_id: string | null; institution: string;
  contact_name: string | null; contact_title: string | null;
  status: "pending" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
  response: string; responded_at: string; is_demo: boolean;
}
interface InstitutionalRecordRow {
  id: string; institution_id: string | null; institution: string;
  title: string; description: string; record_type: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date: string | null; completed_at: string | null; related_issue_ids: string[];
  source_url: string | null; is_demo: boolean; created_at: string; updated_at: string;
}
interface StatusHistoryRow {
  id: string; issue_id: string; old_status: string | null; new_status: string;
  changed_by: string | null; note: string | null; created_at: string;
}
interface AiAnalysisRow {
  id: string; issue_id: string; model: string; summary: string | null;
  sentiment: "positive" | "neutral" | "negative" | null; priority: number | null;
  tags: string[]; raw_output: Json | null; created_at: string;
}
interface DataSourceRow {
  id: string; name: string; source_type: "api" | "scrape" | "manual" | "upload";
  url: string | null; last_synced: string | null; record_count: number;
  status: "active" | "paused" | "error"; config: Json | null; created_at: string;
}
interface IssueCategoryRow {
  id: number; slug: string; label: string; color: string; icon: string | null;
}

// ── Insert types (what you send on INSERT) ────────────────────────────
interface IssueInsert {
  id?: string; title: string; description: string; category: string;
  status?: "open" | "under_review" | "in_progress" | "resolved";
  reporter_id?: string | null; reporter_type?: string | null;
  location_name: string; location_area?: string | null;
  location_lat: number; location_lng: number;
  tags?: string[]; image_url?: string | null; is_demo?: boolean;
}
interface IssueSupportInsert { id?: string; issue_id: string; user_id?: string | null; session_id?: string | null; }
interface ProposalInsert {
  id?: string; title: string; description: string; related_issue_ids?: string[];
  proposer_id?: string | null; estimated_cost?: string | null; estimated_impact?: string | null;
  status?: "proposed" | "under_review" | "approved" | "rejected" | "implemented";
  is_ai_generated?: boolean; is_demo?: boolean;
}
interface ProposalVoteInsert { id?: string; proposal_id: string; user_id?: string | null; session_id?: string | null; }
interface InstitutionInsert { id?: string; name: string; type: string; website?: string | null; logo_url?: string | null; is_demo?: boolean; }
interface InstitutionalResponseInsert {
  id?: string; issue_id: string; institution_id?: string | null; institution: string;
  contact_name?: string | null; contact_title?: string | null;
  status?: "pending" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
  response: string; responded_at?: string; is_demo?: boolean;
}
interface InstitutionalRecordInsert {
  id?: string; institution_id?: string | null; institution: string;
  title: string; description: string; record_type: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string | null; completed_at?: string | null; related_issue_ids?: string[];
  source_url?: string | null; is_demo?: boolean;
}
interface StatusHistoryInsert { id?: string; issue_id: string; old_status?: string | null; new_status: string; changed_by?: string | null; note?: string | null; }
interface AiAnalysisInsert { id?: string; issue_id: string; model: string; summary?: string | null; sentiment?: "positive" | "neutral" | "negative" | null; priority?: number | null; tags?: string[]; raw_output?: Json | null; }
interface DataSourceInsert { id?: string; name: string; source_type: "api" | "scrape" | "manual" | "upload"; url?: string | null; last_synced?: string | null; record_count?: number; status?: "active" | "paused" | "error"; config?: Json | null; }
interface IssueCategoryInsert { id?: number; slug: string; label: string; color: string; icon?: string | null; }
interface ProfileInsert { id: string; display_name?: string | null; avatar_url?: string | null; affiliation?: string | null; is_admin?: boolean; }

export interface Database {
  public: {
    Tables: {
      profiles:               { Row: ProfileRow;               Insert: ProfileInsert;               Update: Partial<ProfileInsert>; Relationships: [] };
      issues:                 { Row: IssueRow;                 Insert: IssueInsert;                 Update: Partial<IssueInsert>; Relationships: [] };
      issue_support:          { Row: IssueSupportRow;          Insert: IssueSupportInsert;          Update: Partial<IssueSupportInsert>; Relationships: [] };
      proposals:              { Row: ProposalRow;              Insert: ProposalInsert;              Update: Partial<ProposalInsert>; Relationships: [] };
      proposal_votes:         { Row: ProposalVoteRow;          Insert: ProposalVoteInsert;          Update: Partial<ProposalVoteInsert>; Relationships: [] };
      institutions:           { Row: InstitutionRow;           Insert: InstitutionInsert;           Update: Partial<InstitutionInsert>; Relationships: [] };
      institutional_responses:{ Row: InstitutionalResponseRow; Insert: InstitutionalResponseInsert; Update: Partial<InstitutionalResponseInsert>; Relationships: [] };
      institutional_records:  { Row: InstitutionalRecordRow;   Insert: InstitutionalRecordInsert;   Update: Partial<InstitutionalRecordInsert>; Relationships: [] };
      status_history:         { Row: StatusHistoryRow;         Insert: StatusHistoryInsert;         Update: Partial<StatusHistoryInsert>; Relationships: [] };
      ai_analysis:            { Row: AiAnalysisRow;            Insert: AiAnalysisInsert;            Update: Partial<AiAnalysisInsert>; Relationships: [] };
      data_sources:           { Row: DataSourceRow;            Insert: DataSourceInsert;            Update: Partial<DataSourceInsert>; Relationships: [] };
      issue_categories:       { Row: IssueCategoryRow;         Insert: IssueCategoryInsert;         Update: Partial<IssueCategoryInsert>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean; };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
