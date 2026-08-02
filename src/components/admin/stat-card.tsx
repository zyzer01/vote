import { motion } from "motion/react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "primary",
  index = 0,
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  accent?: "primary" | "navy" | "yellow" | "red"
  index?: number
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary-foreground",
    navy: "bg-brand-navy/10 text-brand-navy dark:text-white/80",
    yellow: "bg-brand-yellow/20 text-[oklch(0.55_0.13_85)]",
    red: "bg-brand-red/10 text-brand-red",
  }[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
      className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <span className={cn("grid size-9 place-items-center rounded-xl", accentClass)}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="font-heading mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {sub ? <p className="text-muted-foreground mt-1 text-xs">{sub}</p> : null}
    </motion.div>
  )
}
