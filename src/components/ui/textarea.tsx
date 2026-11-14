import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-civic-elevated px-3 py-2 text-sm text-civic-text placeholder:text-civic-text-muted",
          "resize-none transition-colors duration-200",
          "focus-visible:outline-none focus-visible:border-civic-cyan/50 focus-visible:ring-1 focus-visible:ring-civic-cyan/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
