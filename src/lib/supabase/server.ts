import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./config";

export async function createClient() {
  const cookieStore = await cookies();

  // Database generic omitted — TypeScript 5.9 / supabase-js 2.119 inference issue.
  // Add explicit type casts at query call sites instead.
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — cookie mutations are ignored
        }
      },
    },
  });
}
