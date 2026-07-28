import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowLeft, Lock, Radio, Trophy } from "lucide-react"

import { campaignQuery, resultsQuery } from "@/lib/api/queries"
import { ApiError } from "@/lib/api/client"
import { brandStyle } from "@/lib/brand"
import { getCampaignState } from "@/lib/campaign-state"
import { campaignUrl, pageMeta } from "@/lib/seo"
import { Countdown } from "@/components/vote/countdown"
import { Leaderboard } from "@/components/vote/leaderboard"
import { VoteFooter } from "@/components/vote/vote-footer"
import { RouteError } from "@/components/vote/route-states"

export const Route = createFileRoute(
  "/$organizationCode/$campaignSlug/results",
)({
  loader: async ({ context, params }) => {
    try {
      const campaign = await context.queryClient.ensureQueryData(
        campaignQuery(params.organizationCode, params.campaignSlug),
      )
      await context.queryClient.ensureQueryData(resultsQuery(campaign.id))
      return { campaign }
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const { campaign } = loaderData
    const title = `${campaign.name} | Live Results`
    const description = `See the live leaderboard for ${campaign.name}, hosted by ${campaign.organization.name} on Sportly Vote.`
    return {
      meta: pageMeta({
        title,
        description,
        image: campaign.coverImageUrl ?? campaign.logoUrl ?? undefined,
        url: `${campaignUrl(params.organizationCode, params.campaignSlug)}/results`,
      }),
    }
  },
  component: ResultsPage,
  errorComponent: RouteError,
})

function ResultsPage() {
  const { organizationCode, campaignSlug } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(
    campaignQuery(organizationCode, campaignSlug),
  )
  const { data: results } = useSuspenseQuery({
    ...resultsQuery(campaign.id),
    // Keep the leaderboard live while it's public.
    refetchInterval: campaign.resultsVisibility === "LIVE" ? 15_000 : false,
  })

  const state = getCampaignState(campaign)

  return (
    <div style={brandStyle(campaign.brandColor)} className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand-navy text-white">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(90% 120% at 100% 0%, color-mix(in oklch, var(--primary), transparent 40%) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 pt-5 pb-12">
          <Link
            to="/$organizationCode/$campaignSlug"
            params={{ organizationCode, campaignSlug }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {campaign.name}
          </Link>

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Trophy className="text-brand-yellow size-7" />
            </div>
            <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {results.resultsVisible ? "Live Results" : "Results"}
            </h1>
            {results.resultsVisible && campaign.resultsVisibility === "LIVE" ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-red/15 px-3 py-1 text-sm font-medium text-white ring-1 ring-brand-red/30">
                <Radio className="size-3.5 animate-pulse" />
                Updating live
              </span>
            ) : null}
          </div>
        </div>
        <div className="bg-background h-6 rounded-t-[2rem]" />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        {results.resultsVisible ? (
          results.categories.length === 0 ? (
            <EmptyResults />
          ) : (
            <div className="flex flex-col gap-6">
              {results.categories.map((category, index) => (
                <Leaderboard key={category.id} category={category} index={index} />
              ))}
            </div>
          )
        ) : (
          <LockedResults
            message={results.message}
            countdownTo={
              campaign.resultsVisibility === "HIDDEN_UNTIL_CLOSE" &&
              state.state === "live"
                ? campaign.closesAt
                : null
            }
          />
        )}
      </main>

      <VoteFooter organizationName={campaign.organization.name} />
    </div>
  )
}

function LockedResults({
  message,
  countdownTo,
}: {
  message?: string
  countdownTo: string | null
}) {
  return (
    <div className="border-border/70 bg-card mx-auto max-w-md rounded-3xl border p-10 text-center">
      <div className="bg-muted text-muted-foreground mx-auto grid size-14 place-items-center rounded-2xl">
        <Lock className="size-6" />
      </div>
      <h2 className="font-heading mt-4 text-xl font-bold">Results are sealed</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {message ?? "Results aren't public for this campaign yet."}
      </p>
      {countdownTo ? (
        <div className="mt-6 flex justify-center">
          <Countdown to={countdownTo} label="Revealed in" tone="onLight" />
        </div>
      ) : null}
    </div>
  )
}

function EmptyResults() {
  return (
    <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-12 text-center">
      No votes have been cast yet. Results will appear here as votes come in.
    </div>
  )
}
