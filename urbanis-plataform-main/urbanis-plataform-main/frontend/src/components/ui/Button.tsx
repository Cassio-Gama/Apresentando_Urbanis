import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
          variant === "default" && "bg-primary text-primary-foreground hover:brightness-110",
          variant === "outline" && "border border-border bg-transparent hover:bg-white/5",
          variant === "ghost" && "hover:bg-white/5 hover:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
