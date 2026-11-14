"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

type IssueRow = Database["public"]["Tables"]["issues"]["Row"];
type IssueInsert = Database["public"]["Tables"]["issues"]["Insert"];

export interface SubmitIssueInput {
  title: string;
  description: string;
  category: string;
  reporterType?: string;
  locationName: string;
  locationArea?: string;
  locationLat: number;
  locationLng: number;
  tags?: string[];
  imageUrl?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  issueId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) { return supabase; }

export async function submitIssue(input: SubmitIssueInput): Promise<ActionResult> {
  if (!hasSupabaseConfig()) {
    return { success: false, error: "Database not configured. Please set up Supabase." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload: IssueInsert = {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    reporter_id: user?.id ?? null,
    reporter_type: input.reporterType ?? null,
    location_name: input.locationName.trim(),
    location_area: input.locationArea?.trim() ?? null,
    location_lat: input.locationLat,
    location_lng: input.locationLng,
    tags: input.tags ?? [],
    image_url: input.imageUrl ?? null,
    status: "open",
    is_demo: false,
  };

  const { data, error } = await db(supabase)
    .from("issues")
    .insert(payload)
    .select("id")
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (error) {
    console.error("submitIssue error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/explore");
  revalidatePath("/");
  return { success: true, issueId: data?.id };
}

export async function getIssues(filters?: {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  if (!hasSupabaseConfig()) return { data: null as IssueRow[] | null, error: "No database" };

  const supabase = await createClient();
  let query = db(supabase)
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters?.limit) query = query.limit(filters.limit);

  const result = await query as { data: IssueRow[] | null; error: { message: string } | null };
  return result;
}

export async function getIssueById(id: string) {
  if (!hasSupabaseConfig()) return { data: null as IssueRow | null, error: "No database" };

  const supabase = await createClient();
  const result = await db(supabase)
    .from("issues")
    .select("*")
    .eq("id", id)
    .single() as { data: IssueRow | null; error: { message: string } | null };
  return result;
}
