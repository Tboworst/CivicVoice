"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noDb = !hasSupabaseConfig();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (noDb) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Radio className="w-6 h-6 text-civic-cyan" />
            <span className="text-xl font-bold tracking-tight">CivicVoice</span>
          </div>
          <h1 className="text-2xl font-bold text-civic-text">Sign in</h1>
          <p className="text-sm text-civic-text-muted mt-1">
            Access your community account
          </p>
        </div>

        {noDb && (
          <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm text-center">
            Supabase not configured — auth is unavailable in demo mode.
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs text-civic-text-muted mb-1.5 block">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@towson.edu"
              disabled={noDb || loading}
            />
          </div>

          <div>
            <label className="text-xs text-civic-text-muted mb-1.5 block">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={noDb || loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={noDb || loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-civic-text-muted mt-4">
          No account?{" "}
          <Link href="/auth/signup" className="text-civic-cyan hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
