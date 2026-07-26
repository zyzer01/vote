import { Link } from "@tanstack/react-router"
import { ArrowRight, BarChart3, Lock } from "lucide-react"

import type { PublicCampaign } from "@/lib/api/types"

/**
 * Card at the foot of the landing page pointing to the leaderboard. Adapts its
 * copy to the campaign's results-visibility rule so we never promise results
 * that aren't public.
 */
export function ResultsTeaser({
  campaign,
  organizationCode,
}: {
  campaign: PublicCampaign
  organizationCode: string
}) {
  const live = campaign.resultsVisibility === "LIVE"
  const untilClose = campaign.resultsVisibility === "HIDDEN_UNTIL_CLOSE"

  // Admin-only results: nothing public to link to.
  if (campaign.resultsVisibility === "ADMIN_ONLY") return null

  return (
    <section className="mt-20">
      <div className="bg-brand-navy relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 120% at 100% 0%, color-mix(in oklch, var(--primary), transparent 40%) 0%, transparent 55%)",
          }}
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {live ? <BarChart3 className="size-3.5" /> : <Lock className="size-3.5" />}
              {live ? "Live leaderboard" : "Results locked"}
            </span>
            <h2 className="font-heading mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {live
                ? "See who's leading right now"
                : untilClose
                  ? "Results reveal when voting closes"
                  : "Follow the results"}
            </h2>
            <p className="mt-2 text-white/70">
              {live
                ? "Follow every category on the live leaderboard as votes come in."
                : untilClose
                  ? "The leaderboard stays sealed until the final vote is cast -keeping it fair for everyone."
                  : "Check back to see how the race unfolds."}
            </p>
          </div>

          {live ? (
            <Link
              to="/$organizationCode/$campaignSlug/results"
              params={{ organizationCode, campaignSlug: campaign.slug }}
              className="text-brand-navy inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
            >
              View live results
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
