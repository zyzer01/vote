import { motion } from "motion/react"
import { Crown, Medal } from "lucide-react"

import type { ResultsCategory } from "@/lib/api/types"
import { formatCompact, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

/** One category's ranked results: a podium for the top three, then a list. */
export function Leaderboard({
  category,
  index,
}: {
  category: ResultsCategory
  index: number
}) {
  const podium = category.nominees.slice(0, 3)
  const rest = category.nominees.slice(3)

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      className="border-border/70 bg-card overflow-hidden rounded-3xl border"
    >
      <div className="border-border/60 flex items-baseline justify-between border-b px-6 py-5">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {category.name}
        </h2>
        <span className="text-muted-foreground text-sm">
          {formatNumber(category.totalVotes)} votes
        </span>
      </div>

      {category.nominees.length === 0 ? (
        <p className="text-muted-foreground p-8 text-center text-sm">
          No votes yet -be the first.
        </p>
      ) : (
        <>
          {podium.length > 0 ? (
            <div className="grid grid-cols-3 items-end gap-3 px-4 pt-8 pb-6 sm:gap-5 sm:px-8">
              {orderForPodium(podium).map((nominee) => (
                <PodiumColumn key={nominee.id} nominee={nominee} />
              ))}
            </div>
          ) : null}

          {rest.length > 0 ? (
            <ul className="divide-border/60 border-border/60 divide-y border-t">
              {rest.map((nominee) => (
                <li
                  key={nominee.id}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <span className="text-muted-foreground w-6 text-center text-sm font-semibold tabular-nums">
                    {nominee.rank}
                  </span>
                  <Avatar
                    src={nominee.imageUrl}
                    name={nominee.displayName}
                    className="size-9"
                  />
                  <span className="flex-1 truncate text-sm font-medium">
                    {nominee.displayName}
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {nominee.sharePercent.toFixed(1)}%
                  </span>
                  <span className="w-16 text-right text-sm font-semibold tabular-nums">
                    {formatCompact(nominee.votes)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </motion.section>
  )
}

/** Reorder [1st,2nd,3rd] → [2nd,1st,3rd] so first place sits centre-tall. */
function orderForPodium<T>(top: T[]): T[] {
  if (top.length === 3) return [top[1], top[0], top[2]]
  if (top.length === 2) return [top[1], top[0]]
  return top
}

function PodiumColumn({
  nominee,
}: {
  nominee: ResultsCategory["nominees"][number]
}) {
  const rank = nominee.rank
  const height = rank === 1 ? "h-24 sm:h-28" : rank === 2 ? "h-16 sm:h-20" : "h-12 sm:h-16"
  const ring =
    rank === 1
      ? "ring-brand-yellow"
      : rank === 2
        ? "ring-muted-foreground/40"
        : "ring-[oklch(0.65_0.13_50)]"
  const barTone =
    rank === 1
      ? "from-brand-yellow/80 to-brand-yellow/30"
      : rank === 2
        ? "from-muted-foreground/30 to-muted-foreground/10"
        : "from-[oklch(0.65_0.13_50)]/50 to-[oklch(0.65_0.13_50)]/15"

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {rank === 1 ? (
          <Crown className="text-brand-yellow absolute -top-5 left-1/2 size-6 -translate-x-1/2 fill-brand-yellow/30" />
        ) : null}
        <Avatar
          src={nominee.imageUrl}
          name={nominee.displayName}
          className={cn(
            "ring-2 ring-offset-2 ring-offset-[var(--card)]",
            ring,
            rank === 1 ? "size-16 sm:size-20" : "size-12 sm:size-14",
          )}
        />
        <span
          className={cn(
            "bg-background absolute -bottom-1 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full text-xs font-bold shadow ring-1 ring-black/5",
          )}
        >
          {rank}
        </span>
      </div>
      <p className="mt-3 max-w-full truncate text-center text-xs font-semibold sm:text-sm">
        {nominee.displayName}
      </p>
      <p className="text-muted-foreground text-xs tabular-nums">
        {formatCompact(nominee.votes)} · {nominee.sharePercent.toFixed(1)}%
      </p>
      <div
        className={cn(
          "mt-2 flex w-full items-start justify-center rounded-t-lg bg-gradient-to-b pt-1.5",
          barTone,
          height,
        )}
      >
        {rank === 1 ? null : (
          <Medal
            className={cn(
              "size-4 opacity-70",
              rank === 2 ? "text-muted-foreground" : "text-[oklch(0.55_0.13_50)]",
            )}
          />
        )}
      </div>
    </div>
  )
}
