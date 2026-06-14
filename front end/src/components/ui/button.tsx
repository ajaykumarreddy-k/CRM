import * as React from "react"
import { cn } from "@/src/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "salmon" | "dark", size?: "default" | "sm" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#fdfdfd] border border-subtle shadow-sm text-primary hover:bg-background": variant === "default",
            "border border-subtle bg-surface hover:bg-background text-primary shadow-sm": variant === "outline",
            "hover:bg-background text-primary": variant === "ghost",
            "bg-accent text-white hover:bg-[#d85240] shadow-sm": variant === "salmon",
            "bg-[#121212] text-white hover:bg-gray-800 shadow-sm": variant === "dark",
            "h-12 px-7 py-3.5 text-[15px]": size === "default",
            "h-9 px-4 text-[13px]": size === "sm",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
