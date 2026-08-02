import { motion } from "motion/react"

import { formatCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Slim animated share bar used under a nominee when results are public. */
export function VoteBar({
  votes,
  totalVotes,
  leading,
  className,
}: {
  votes: number
  totalVotes: number
  leading?: boolean
  className?: string
}) {
  const share = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {formatCompact(votes)} {votes === 1 ? "vote" : "votes"}
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            leading ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {share.toFixed(1)}%
        </span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${share}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className={cn(
            "h-full rounded-full",
            leading
              ? "bg-primary"
              : "bg-[color-mix(in_oklch,var(--primary),var(--muted-foreground)_35%)]",
          )}
        />
      </div>
    </div>
  )
}
