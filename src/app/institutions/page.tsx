export const revalidate = 300;

import {
  Building2,
  GraduationCap,
  Landmark,
  Users,
  Globe,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { getInstitutions } from "@/app/actions/geography";
import type { InstitutionItem } from "@/app/actions/geography";

const TYPE_META: Record<
  string,
  { label: string; icon: typeof Building2; color: string }
> = {
  university: {
    label: "University",
    icon: GraduationCap,
    color: "#00d4ff",
  },
  university_dept: {
    label: "University Department",
    icon: GraduationCap,
    color: "#3b82f6",
  },
  government: {
    label: "Government",
    icon: Landmark,
    color: "#a855f7",
  },
  government_dept: {
    label: "Government Agency",
    icon: Landmark,
    color: "#8b5cf6",
  },
  community: {
    label: "Community Organization",
    icon: Users,
    color: "#84cc16",
  },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type, icon: Building2, color: "#64748b" };
}

function groupByType(items: InstitutionItem[]) {
  const order = [
    "university",
    "university_dept",
    "government",
    "government_dept",
    "community",
  ];
  const groups = new Map<string, InstitutionItem[]>();
  for (const item of items) {
    const existing = groups.get(item.type) ?? [];
    existing.push(item);
    groups.set(item.type, existing);
  }
  // Sort by predefined order, unknown types at the end
  return [...groups.entries()].sort(([a], [b]) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export default async function InstitutionsPage() {
  const { items, fromDB } = await getInstitutions();
  const groups = groupByType(items);

  const totalResponses = items.reduce((s, i) => s + i.responseCount, 0);
  const activeInstitutions = items.filter((i) => i.responseCount > 0).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-civic-text flex items-center gap-2">
            <Building2 className="w-6 h-6 text-civic-cyan" />
            Institution Directory
          </h1>
          <p className="text-civic-text-muted mt-1">
            Institutions responsible for community issues in Towson, MD — their
            roles, contacts, and accountability records.
          </p>
        </div>
        {!fromDB && <DemoNotice inline />}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-5 border border-white/7 mb-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-civic-lime flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-civic-text mb-1">
              How Institutions Are Held Accountable
            </h2>
            <p className="text-sm text-civic-text-muted leading-relaxed">
              When a community issue gains significant support, CivicVoice
              formally submits it to the relevant institution. All responses,
              commitments, and outcomes are recorded in the Accountability
              Tracker — publicly visible, never fabricated.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Institutions Listed", value: items.length, color: "#00d4ff" },
          { label: "Active Responders", value: activeInstitutions, color: "#84cc16" },
          { label: "Responses Recorded", value: totalResponses, color: "#a855f7" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="glass rounded-xl p-4 text-center border border-white/7"
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color }}>
              {value}
            </p>
            <p className="text-xs text-civic-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Grouped institution list */}
      <div className="space-y-8">
        {groups.map(([type, groupItems]) => {
          const meta = getTypeMeta(type);
          const Icon = meta.icon;

          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
                <h2 className="text-base font-semibold text-civic-text">
                  {meta.label}
                  {groupItems.length > 1 ? `s` : ""}
                </h2>
                <span
                  className="text-xs rounded-full px-2 py-0.5 ml-1"
                  style={{
                    backgroundColor: `${meta.color}12`,
                    border: `1px solid ${meta.color}25`,
                    color: meta.color,
                  }}
                >
                  {groupItems.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupItems.map((inst) => (
                  <div
                    key={inst.id}
                    className="glass rounded-2xl p-5 border border-white/7 hover:border-white/12 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-civic-text leading-snug">
                          {inst.name}
                        </h3>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </p>
                      </div>

                      <div
                        className="rounded-lg p-2 flex-shrink-0"
                        style={{
                          backgroundColor: `${meta.color}10`,
                          border: `1px solid ${meta.color}20`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: meta.color }}
                        />
                      </div>
                    </div>

                    {/* Response count */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-civic-text-muted" />
                        <span className="text-xs text-civic-text-muted">
                          {inst.responseCount > 0 ? (
                            <>
                              <span
                                className="font-semibold"
                                style={{ color: "#84cc16" }}
                              >
                                {inst.responseCount}
                              </span>{" "}
                              response
                              {inst.responseCount !== 1 ? "s" : ""} on record
                            </>
                          ) : (
                            "No responses recorded yet"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href="/accountability" className="flex-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full gap-1.5 text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Accountability
                        </Button>
                      </Link>
                      {inst.website && (
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-civic-text-muted"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-10 glass rounded-2xl p-6 border border-civic-cyan/15 text-center">
        <Building2 className="w-10 h-10 text-civic-cyan mx-auto mb-3 opacity-40" />
        <h2 className="text-lg font-bold text-civic-text mb-2">
          Hold institutions accountable
        </h2>
        <p className="text-sm text-civic-text-muted max-w-lg mx-auto mb-5">
          Submit community issues, build support through voting, and track
          institutional responses from submission to resolution.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/submit">
            <Button className="gap-2">Submit an Issue</Button>
          </Link>
          <Link href="/accountability">
            <Button variant="secondary" className="gap-2">
              View Accountability Tracker
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
