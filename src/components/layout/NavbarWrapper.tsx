import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { Navbar } from "./Navbar";

export async function NavbarWrapper() {
  let displayName: string | null = null;
  let isAdmin = false;

  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Cast needed: TypeScript 5.9 / supabase-js 2.119 generic inference issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("display_name, is_admin")
          .eq("id", user.id)
          .single() as { data: { display_name: string | null; is_admin: boolean } | null; error: unknown };
        displayName = profile?.display_name ?? user.email?.split("@")[0] ?? null;
        isAdmin = profile?.is_admin ?? false;
      }
    } catch {
      // Supabase not reachable — render unauthenticated nav
    }
  }

  return <Navbar displayName={displayName} isAdmin={isAdmin} />;
}
