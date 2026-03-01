import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline"
  className?: string
  style?: React.CSSProperties
}

export function Badge({ children, variant = "default", className, style }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    outline: "border border-gray-300 text-gray-700",
  }
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}
      style={style}
    >
      {children}
    </span>
  )
}
