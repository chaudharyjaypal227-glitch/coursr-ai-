import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Extracted classes to avoid large string literals
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20",
      outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100",
      ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
      link: "text-indigo-400 underline-offset-4 hover:underline",
      glass: "bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
