"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Mail, Building2, GraduationCap, Users, Landmark, Loader2 } from "lucide-react";
import { getConnectedOrganizations } from "@/app/actions/ai";
import type { ConnectedOrg } from "@/app/actions/ai";
import type { IssueCategory } from "@/types";

const TYPE_META: Record<ConnectedOrg["type"], { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  government:  { label: "Government",  color: "#FFBB00", Icon: Landmark },
  university:  { label: "University",  color: "#84cc16", Icon: GraduationCap },
  nonprofit:   { label: "Nonprofit",   color: "#a855f7", Icon: Building2 },
  community:   { label: "Community",   color: "#3b82f6", Icon: Users },
};

function OrgLogo({ website, name }: { website: string; name: string }) {
  const [err, setErr] = useState(false);
  let domain = "";
  try { domain = new URL(website).hostname; } catch { /* ignore */ }

  if (err || !domain) {
    return (
      <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
        <Building2 className="w-4 h-4 text-civic-text-muted" />
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      onError={() => setErr(true)}
      className="w-9 h-9 rounded-lg bg-white/8 object-contain flex-shrink-0 p-1.5"
    />
  );
}

interface ConnectedOrgsWidgetProps {
  category: IssueCategory;
  title: string;
  description: string;
  locationName: string;
}

export function ConnectedOrgsWidget({
  category,
  title,
  description,
  locationName,
}: ConnectedOrgsWidgetProps) {
  const [orgs, setOrgs] = useState<ConnectedOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnectedOrganizations(category, title, description, locationName)
      .then((res) => {
        if (res.data) setOrgs(res.data);
      })
      .finally(() => setLoading(false));
  }, [category, title, description, locationName]);

  return (
    <div className="glass rounded-2xl p-6 border border-white/7">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-civic-cyan" />
        <h2 className="text-base font-semibold text-civic-text">Connected Organizations</h2>
      </div>
      <p className="text-xs text-civic-text-muted mb-5">
        Organizations, agencies, and groups with a direct role in this issue.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-civic-text-muted py-4">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Finding relevant organizations…
        </div>
      ) : orgs.length === 0 ? (
        <p className="text-xs text-civic-text-muted">No organizations found for this issue.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org, i) => {
            const meta = TYPE_META[org.type] ?? TYPE_META.community;
            const { Icon } = meta;
            return (
              <div
                key={i}
                className="flex gap-3 p-3.5 rounded-xl border border-white/7 bg-white/2 hover:border-white/12 transition-colors"
              >
                <OrgLogo website={org.website} name={org.name} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-sm font-semibold text-civic-text leading-snug">
                      {org.name}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-civic-cyan mb-1 leading-snug">
                    {org.role}
                  </p>
                  <p className="text-xs text-civic-text-muted leading-relaxed mb-2">
                    {org.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-civic-cyan hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit website
                    </a>
                    {org.contactEmail && (
                      <a
                        href={`mailto:${org.contactEmail}`}
                        className="inline-flex items-center gap-1 text-xs text-civic-text-muted hover:text-civic-text transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        {org.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
