import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { IssueCategory } from "@/types";

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, className, size = "md" }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}12`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
