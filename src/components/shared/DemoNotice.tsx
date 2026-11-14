import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoNoticeProps {
  className?: string;
  inline?: boolean;
}

export function DemoNotice({ className, inline = false }: DemoNoticeProps) {
  if (inline) {
    return (
      <span className={cn("demo-notice", className)}>
        <FlaskConical className="w-3 h-3" />
        Demo data
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3",
        className
      )}
    >
      <FlaskConical className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-amber-400">Demonstration Data</p>
        <p className="text-xs text-amber-400/70 mt-0.5">
          This page displays sample data to illustrate CivicVoice&apos;s features.
          Figures shown are not real votes, statistics, or institutional responses.
        </p>
      </div>
    </div>
  );
}
