import { useMemo, useState } from "react"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { ArrowLeft, BarChart3, Gift } from "lucide-react"

import { allowanceQuery, ballotQuery } from "@/lib/api/queries"
import { ApiError } from "@/lib/api/client"
import { brandStyle } from "@/lib/brand"
import { getCampaignState } from "@/lib/campaign-state"
import { campaignUrl, pageMeta } from "@/lib/seo"
import { nomineeShareUrl } from "@/lib/share"
import type { BallotNominee } from "@/lib/api/types"
import { useTrackView } from "@/hooks/use-track-view"
import { NomineeCard } from "@/components/vote/nominee-card"
import { VoteSheet } from "@/components/vote/vote-sheet"
import { VoteFooter } from "@/components/vote/vote-footer"
import { StatusBanner } from "@/components/vote/status-banner"
import { RouteError } from "@/components/vote/route-states"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute(
  "/$organizationCode/$campaignSlug/$categoryId/",
)({
  loader: async ({ context, params }) => {
    try {
      const ballot = await context.queryClient.ensureQueryData(
        ballotQuery(params.categoryId),
      )
      return { ballot }
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const { ballot } = loaderData
    const title = `${ballot.name} | ${ballot.campaign.name}`
    const description =
      ballot.description ??
      `Vote for your favourite in ${ballot.name}, part of ${ballot.campaign.name} on Sportly Vote.`
    return {
      meta: pageMeta({
        title,
        description,
        image:
          ballot.imageUrl ??
          ballot.campaign.coverImageUrl ??
          ballot.campaign.logoUrl ??
          undefined,
        url: `${campaignUrl(params.organizationCode, params.campaignSlug)}/${params.categoryId}`,
      }),
    }
  },
  component: BallotPage,
  errorComponent: RouteError,
})

function BallotPage() {
  const { organizationCode, campaignSlug, categoryId } = Route.useParams()
  const { data: ballot } = useSuspenseQuery(ballotQuery(categoryId))
  const campaign = ballot.campaign
  const state = getCampaignState(campaign)

  const isFreeCapable = campaign.votingMode !== "PAID"
  const { data: allowance } = useQuery(
    allowanceQuery(categoryId, isFreeCapable && state.canVote),
  )

  useTrackView(campaign.id, { categoryId })

  const [activeNominee, setActiveNominee] = useState<BallotNominee | null>(null)
  const [justVoted, setJustVoted] = useState<Set<string>>(new Set())

  // Rankings for the leading crown + share bars.
  const { totalVotes, leaderId } = useMemo(() => {
    const total = ballot.nominees.reduce((sum, n) => sum + (n.votes ?? 0), 0)
    const leader = [...ballot.nominees]
      .filter((n) => n.status !== "DISQUALIFIED")
      .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0]
    return {
      totalVotes: total,
      leaderId: total > 0 ? leader.id : null,
    }
  }, [ballot.nominees])

  return (
    <div style={brandStyle(campaign.brandColor)} className="flex min-h-svh flex-col">
      {/* Sticky nav */}
      <header className="bg-background/85 border-border/60 sticky top-0 z-30 border-b backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
          <Link
            to="/$organizationCode/$campaignSlug"
            params={{ organizationCode, campaignSlug }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="max-w-[40vw] truncate">{campaign.name}</span>
          </Link>
          {campaign.resultsVisibility === "LIVE" ? (
            <Link
              to="/$organizationCode/$campaignSlug/results"
              params={{ organizationCode, campaignSlug }}
              className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Results</span>
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8">
        {/* Category header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{ballot.name}</Badge>
            {isFreeCapable && (allowance?.remaining ?? 0) > 0 ? (
              <Badge variant="success">
                <Gift className="size-3" />
                {allowance!.remaining} free vote
                {allowance!.remaining === 1 ? "" : "s"} left
              </Badge>
            ) : null}
            {ballot.resultsVisible ? (
              <Badge variant="outline">{totalVotes.toLocaleString()} votes cast</Badge>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {ballot.name}
          </h1>
          {ballot.description ? (
            <p className="text-muted-foreground max-w-2xl">{ballot.description}</p>
          ) : null}
        </div>

        {!state.canVote ? (
          <StatusBanner state={state} className="mt-6" />
        ) : null}

        {/* Nominees */}
        {ballot.nominees.length === 0 ? (
          <div className="border-border/70 text-muted-foreground mt-8 rounded-2xl border border-dashed p-12 text-center">
            Nominees for this category haven't been added yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ballot.nominees.map((nominee, index) => (
              <NomineeCard
                key={nominee.id}
                nominee={nominee}
                organizationCode={organizationCode}
                campaignSlug={campaignSlug}
                categoryId={categoryId}
                campaignName={campaign.name}
                categoryName={ballot.name}
                totalVotes={totalVotes}
                leading={nominee.id === leaderId}
                resultsVisible={ballot.resultsVisible}
                canVote={state.canVote}
                justVoted={justVoted.has(nominee.id)}
                index={index}
                onVote={setActiveNominee}
              />
            ))}
          </div>
        )}
      </main>

      <VoteFooter organizationName={undefined} />

      <VoteSheet
        nominee={activeNominee}
        ballot={ballot}
        allowance={allowance}
        shareUrl={
          activeNominee
            ? nomineeShareUrl({
                organizationCode,
                campaignSlug,
                categoryId,
                nomineeSlug: activeNominee.slug,
              })
            : undefined
        }
        onClose={() => setActiveNominee(null)}
        onVoted={(id) => setJustVoted((prev) => new Set(prev).add(id))}
      />
    </div>
  )
}
