import Link from "next/link";
import { Radio, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/7 bg-civic-bg mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 rounded-lg bg-civic-cyan/20 border border-civic-cyan/40" />
                <div className="absolute inset-1.5 rounded-sm bg-civic-cyan/80 flex items-center justify-center">
                  <Radio className="w-2.5 h-2.5 text-civic-bg" />
                </div>
              </div>
              <span className="text-sm font-bold text-civic-text">
                CIVIC<span className="text-civic-cyan">VOICE</span>
              </span>
            </div>
            <p className="text-xs text-civic-text-muted leading-relaxed">
              Turning local voices into local action. Community intelligence
              for Towson University and the greater Towson, MD area.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-civic-text uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/explore", label: "Explore Issues" },
                { href: "/priorities", label: "Priorities" },
                { href: "/proposals", label: "Proposals" },
                { href: "/accountability", label: "Accountability" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-civic-text-muted hover:text-civic-cyan transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-semibold text-civic-text uppercase tracking-wider mb-3">
              Community
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/submit", label: "Submit an Issue" },
                { href: "/proposals", label: "Support a Proposal" },
                { href: "/explore", label: "Browse the Map" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-civic-text-muted hover:text-civic-cyan transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus area */}
          <div>
            <h4 className="text-xs font-semibold text-civic-text uppercase tracking-wider mb-3">
              Focus Area
            </h4>
            <div className="glass rounded-lg p-3">
              <p className="text-xs text-civic-text-muted">
                Towson University &amp; surrounding community, Baltimore County,
                Maryland
              </p>
              <div className="mt-2 flex items-center gap-1 text-civic-cyan text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-civic-cyan animate-pulse" />
                Active · 2024
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/7 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-civic-text-muted">
            © 2024 CivicVoice. All demonstration data is clearly labeled.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.towson.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-civic-text-muted hover:text-civic-cyan transition-colors"
            >
              Towson University
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.baltimorecountymd.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-civic-text-muted hover:text-civic-cyan transition-colors"
            >
              Baltimore County
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
