import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-lg",
  {
    variants: {
      variant: {
        default:
          "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 shadow-neon-cyan/20 shadow-sm",
        secondary:
          "border-neon-purple/30 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 shadow-neon-purple/20 shadow-sm",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "text-white border-white/20 hover:bg-white/10",
        emerald: "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald hover:bg-neon-emerald/20 shadow-neon-emerald/20 shadow-sm",
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
