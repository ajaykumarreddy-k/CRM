import * as React from "react"
import { cn } from "@/src/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "danger" | "salmon" | "outline" | "dark" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors focus:outline-none",
          {
            "bg-background text-primary": variant === "default",
            "bg-[#e6f4ea] text-[#1e8e3e]": variant === "success",
            "bg-[#fef7e0] text-[#f29900]": variant === "warning",
            "bg-[#fce8e6] text-accent": variant === "danger",
            "bg-accent text-white": variant === "salmon",
            "bg-[#121212] text-white": variant === "dark",
            "border border-subtle text-primary bg-surface shadow-sm": variant === "outline"
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
