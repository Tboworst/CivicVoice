import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  iconColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = "#00d4ff",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-5 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-civic-text-muted font-medium">{label}</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15`, border: `1px solid ${iconColor}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-civic-text tabular-nums">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trend.value > 0 ? "text-civic-lime" : "text-civic-red")}>
            {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
