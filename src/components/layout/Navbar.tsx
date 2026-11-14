"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Layers,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  LayoutDashboard,
  Radio,
  LogIn,
  QrCode,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore", icon: Layers },
  { href: "/priorities", label: "Priorities", icon: TrendingUp },
  { href: "/proposals", label: "Proposals", icon: Lightbulb },
  { href: "/accountability", label: "Accountability", icon: ShieldCheck },
  { href: "/institutions", label: "Institutions", icon: Building2 },
];

interface NavbarProps {
  displayName?: string | null;
  isAdmin?: boolean;
}

export function Navbar({ displayName, isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminPage = pathname.startsWith("/admin");
  const isLoggedIn = Boolean(displayName);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16",
          "glass border-b border-white/7",
          "transition-all duration-300"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-civic-cyan/20 border border-civic-cyan/40 group-hover:border-civic-cyan/70 transition-colors" />
              <div className="absolute inset-1.5 rounded-sm bg-civic-cyan/80 flex items-center justify-center">
                <Radio className="w-3 h-3 text-civic-bg" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-civic-text tracking-wide">
                CIVIC<span className="text-civic-cyan">VOICE</span>
              </span>
              <span className="text-[9px] text-civic-text-muted tracking-widest uppercase">
                Towson, MD
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    active
                      ? "text-civic-cyan bg-civic-cyan/8 border border-civic-cyan/20"
                      : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Join link (mobile-friendly voting) */}
            <Link
              href="/join"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-civic-text-muted hover:text-civic-text hover:bg-white/5 transition-all duration-200"
            >
              <QrCode className="w-3.5 h-3.5" />
              Participate
            </Link>

            {/* Admin or sign-in */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all duration-200",
                  isAdminPage
                    ? "text-civic-cyan bg-civic-cyan/8 border border-civic-cyan/20"
                    : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            {isLoggedIn ? (
              <UserMenu displayName={displayName ?? null} isAdmin={isAdmin} />
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-civic-text-muted hover:text-civic-text hover:bg-white/5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Link>
            )}

            <Link href="/submit">
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                Submit Issue
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-civic-text-muted hover:text-civic-text hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 glass-elevated md:hidden">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "text-civic-cyan bg-civic-cyan/8 border border-civic-cyan/20"
                      : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <div className="border-t border-white/8 mt-2 pt-2 flex flex-col gap-2">
              <Link
                href="/join"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-civic-text-muted hover:text-civic-text hover:bg-white/5"
              >
                <QrCode className="w-4 h-4" />
                Participate (vote on issues)
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {isLoggedIn ? (
                <div className="px-4 py-2 text-sm text-civic-text-muted">
                  Signed in as{" "}
                  <span className="text-civic-text">{displayName}</span>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              )}
              <Link href="/submit" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Submit an Issue
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
