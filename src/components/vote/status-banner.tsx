import { CalendarClock, Lock, PauseCircle } from "lucide-react"

import type { CampaignState } from "@/lib/campaign-state"
import { cn } from "@/lib/utils"
import { Countdown } from "./countdown"

/** Inline notice shown on the ballot when voting isn't currently open. */
export function StatusBanner({
  state,
  className,
}: {
  state: CampaignState
  className?: string
}) {
  const config = {
    upcoming: {
      icon: CalendarClock,
      title: "Voting hasn't opened yet",
      body: "Nominees are listed below -come back when voting goes live.",
      tone: "border-brand-yellow/30 bg-brand-yellow/10",
    },
    paused: {
      icon: PauseCircle,
      title: "Voting is paused",
      body: "The organizer has temporarily paused voting. Please check back soon.",
      tone: "border-border bg-muted/50",
    },
    closed: {
      icon: Lock,
      title: "Voting has closed",
      body: "This category is no longer accepting votes.",
      tone: "border-border bg-muted/50",
    },
    ended: {
      icon: Lock,
      title: "Voting has ended",
      body: "Thanks to everyone who took part.",
      tone: "border-border bg-muted/50",
    },
    live: null,
  }[state.state]

  if (!config) return null
  const Icon = config.icon

  return (
    <div className={cn("rounded-2xl border p-5", config.tone, className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="flex-1">
          <p className="font-heading font-semibold">{config.title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">{config.body}</p>
          {state.countdownTo && state.state === "upcoming" ? (
            <div className="mt-4 flex justify-start">
              <Countdown
                to={state.countdownTo}
                label={state.countdownLabel}
                tone="onLight"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
