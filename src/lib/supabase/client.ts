"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

export function createClient() {
  // Database generic omitted — TypeScript 5.9 / supabase-js 2.119 inference issue.
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
