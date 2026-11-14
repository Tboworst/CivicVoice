"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Shield, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  displayName: string | null;
  isAdmin: boolean;
}

export function UserMenu({ displayName, isAdmin }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-sm text-civic-text-muted hover:text-civic-text transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-civic-cyan/20 border border-civic-cyan/30 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-civic-cyan" />
        </span>
        <span className="hidden sm:block max-w-[100px] truncate">
          {displayName ?? "Account"}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 glass-elevated rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/7">
              <p className="text-xs font-medium text-civic-text truncate">
                {displayName ?? "Anonymous"}
              </p>
            </div>
            <div className="py-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-white/5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-civic-text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
