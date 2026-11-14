"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const AFFILIATIONS = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "staff", label: "Staff" },
  { value: "community", label: "Community Member" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const noDb = !hasSupabaseConfig();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (noDb) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, affiliation },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-12 h-12 text-civic-lime mx-auto mb-4" />
          <h1 className="text-xl font-bold text-civic-text mb-2">Check your email</h1>
          <p className="text-sm text-civic-text-muted">
            We sent a confirmation link to <strong className="text-civic-text">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-6 text-sm text-civic-cyan hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Radio className="w-6 h-6 text-civic-cyan" />
            <span className="text-xl font-bold tracking-tight">CivicVoice</span>
          </div>
          <h1 className="text-2xl font-bold text-civic-text">Create account</h1>
          <p className="text-sm text-civic-text-muted mt-1">
            Join the community platform
          </p>
        </div>

        {noDb && (
          <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm text-center">
            Supabase not configured — sign-up is unavailable in demo mode.
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
              Display name
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={noDb || loading}
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              disabled={noDb || loading}
            />
          </div>

          <div>
            <label className="text-xs text-civic-text-muted mb-1.5 block">
              Affiliation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AFFILIATIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAffiliation(a.value)}
                  disabled={noDb || loading}
                  className={`text-xs py-2 px-3 rounded-lg border transition-colors ${
                    affiliation === a.value
                      ? "border-civic-cyan bg-civic-cyan/10 text-civic-cyan"
                      : "border-white/10 text-civic-text-muted hover:border-white/20"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={noDb || loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-civic-text-muted mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-civic-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
