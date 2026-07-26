import { cn } from "@/lib/utils"
import type { VotingState } from "@/lib/campaign-state"

/** Pill showing the live/upcoming/closed state, with a pulsing dot when live. */
export function StatusPill({
  state,
  label,
  className,
}: {
  state: VotingState
  label: string
  className?: string
}) {
  const isLive = state === "live"
  const tone =
    state === "live"
      ? "bg-brand-green/15 text-white ring-brand-green/40"
      : state === "upcoming"
        ? "bg-brand-yellow/15 text-white ring-brand-yellow/40"
        : state === "paused"
          ? "bg-white/10 text-white/90 ring-white/25"
          : "bg-white/10 text-white/80 ring-white/20"

  const dot =
    state === "live"
      ? "bg-brand-green"
      : state === "upcoming"
        ? "bg-brand-yellow"
        : "bg-white/60"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 backdrop-blur-sm",
        tone,
        className,
      )}
    >
      <span className="relative flex size-2">
        {isLive ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              dot,
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", dot)} />
      </span>
      {label}
    </span>
  )
}
