import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-civic-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-civic-cyan text-civic-bg font-semibold hover:bg-civic-cyan/90 shadow-glow-cyan-sm hover:shadow-glow-cyan",
        secondary:
          "bg-civic-elevated text-civic-text border border-white/10 hover:bg-white/5 hover:border-civic-cyan/30",
        outline:
          "border border-civic-cyan/40 text-civic-cyan bg-transparent hover:bg-civic-cyan/10 hover:border-civic-cyan",
        ghost:
          "text-civic-text/70 hover:text-civic-text hover:bg-white/5",
        destructive:
          "bg-civic-red/90 text-white hover:bg-civic-red",
        lime:
          "bg-civic-lime text-civic-bg font-semibold hover:bg-civic-lime/90",
        link:
          "text-civic-cyan underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
