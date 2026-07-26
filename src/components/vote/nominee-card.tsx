import { motion } from "motion/react"
import { Ban, Check, Crown, Vote } from "lucide-react"

import type { BallotNominee } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { VoteBar } from "./vote-bar"

export function NomineeCard({
  nominee,
  totalVotes,
  leading,
  resultsVisible,
  canVote,
  justVoted,
  index,
  onVote,
}: {
  nominee: BallotNominee
  totalVotes: number
  leading: boolean
  resultsVisible: boolean
  canVote: boolean
  justVoted: boolean
  index: number
  onVote: (nominee: BallotNominee) => void
}) {
  const disqualified = nominee.status === "DISQUALIFIED"
  const metadata = readableMetadata(nominee.metadata)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) }}
      className={cn(
        "group border-border/70 bg-card relative flex flex-col overflow-hidden rounded-lg border transition-colors duration-300",
        !disqualified && "hover:border-primary/40",
        leading &&
          resultsVisible &&
          "ring-primary/40 border-primary/40 ring-1",
      )}
    >
      {leading && resultsVisible ? (
        <span className="bg-primary text-primary-foreground absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow">
          <Crown className="size-3.5" />
          Leading
        </span>
      ) : null}

      <div className="relative aspect-square overflow-hidden">
        {nominee.imageUrl ? (
          <img
            src={nominee.imageUrl}
            alt={nominee.displayName}
            loading="lazy"
            className={cn(
              "size-full object-cover transition-transform duration-500",
              !disqualified && "group-hover:scale-105",
              disqualified && "grayscale",
            )}
          />
        ) : (
          <div
            className="grid size-full place-items-center"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--primary), transparent 25%), color-mix(in oklch, var(--primary), black 40%))",
            }}
          >
            <span className="font-heading text-4xl font-bold text-white/90">
              {nominee.displayName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading leading-tight font-semibold">
          {nominee.displayName}
        </h3>
        {metadata.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {metadata.map((m) => (
              <span
                key={m}
                className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[0.7rem] font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        ) : nominee.bio ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {nominee.bio}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {resultsVisible ? (
            <VoteBar
              votes={nominee.votes ?? 0}
              totalVotes={totalVotes}
              leading={leading}
              className="mb-3"
            />
          ) : null}

          {disqualified ? (
            <div className="text-muted-foreground flex items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-sm">
              <Ban className="size-4" />
              Disqualified
            </div>
          ) : (
            <Button
              size="lg"
              variant={justVoted ? "secondary" : "default"}
              disabled={!canVote}
              onClick={() => onVote(nominee)}
              className="w-full font-semibold"
            >
              {justVoted ? (
                <>
                  <Check className="size-4" />
                  Voted
                </>
              ) : (
                <>
                  <Vote className="size-4" />
                  {canVote ? "Vote" : "Voting closed"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/** Pull up to three short string/number values from nominee metadata. */
function readableMetadata(metadata: Record<string, unknown> | null): string[] {
  if (!metadata) return []
  const out: string[] = []
  for (const value of Object.values(metadata)) {
    if (typeof value === "string" && value.trim() && value.length <= 24) {
      out.push(value.trim())
    } else if (typeof value === "number") {
      out.push(String(value))
    }
    if (out.length === 3) break
  }
  return out
}
