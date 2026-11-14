import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-civic-cyan/30 bg-civic-cyan/10 text-civic-cyan",
        secondary: "border-white/10 bg-white/5 text-civic-text/70",
        outline: "border-white/15 bg-transparent text-civic-text/70",
        success: "border-civic-lime/30 bg-civic-lime/10 text-civic-lime",
        warning: "border-amber-400/30 bg-amber-400/10 text-amber-400",
        danger: "border-civic-red/30 bg-civic-red/10 text-civic-red",
        purple: "border-purple-400/30 bg-purple-400/10 text-purple-400",
        blue: "border-blue-400/30 bg-blue-400/10 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
