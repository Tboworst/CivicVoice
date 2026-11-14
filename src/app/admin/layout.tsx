"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Bot,
  Lightbulb,
  Building2,
  ShieldCheck,
  ChevronRight,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/issues", label: "Issues", icon: Layers },
  { href: "/admin/ai-insights", label: "AI Insights", icon: Bot },
  { href: "/admin/proposals", label: "Proposals", icon: Lightbulb },
  { href: "/admin/institutions", label: "Institutions", icon: Building2 },
  { href: "/admin/accountability", label: "Accountability", icon: ShieldCheck },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Admin sidebar */}
      <aside className="hidden md:flex flex-col w-56 glass border-r border-white/7 flex-shrink-0">
        <div className="p-4 border-b border-white/7">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-purple-400/20 border border-purple-400/40" />
              <div className="absolute inset-1.5 rounded-sm bg-purple-400/80 flex items-center justify-center">
                <Radio className="w-2.5 h-2.5 text-civic-bg" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-civic-text">CIVICVOICE</p>
              <p className="text-[9px] text-purple-400 uppercase tracking-widest">
                Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  active
                    ? "bg-purple-400/10 border border-purple-400/20 text-purple-400"
                    : "text-civic-text-muted hover:text-civic-text hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/7">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-civic-text-muted hover:text-civic-cyan transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            Back to public site
          </Link>
        </div>
      </aside>

      {/* Admin content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
