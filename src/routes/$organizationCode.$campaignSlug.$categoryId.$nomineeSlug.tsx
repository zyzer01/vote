import { useMemo, useState } from "react"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Ban,
  BarChart3,
  Check,
  Crown,
  Gift,
  Vote,
} from "lucide-react"

import { allowanceQuery, ballotQuery } from "@/lib/api/queries"
import { ApiError } from "@/lib/api/client"
import { brandStyle } from "@/lib/brand"
import { getCampaignState } from "@/lib/campaign-state"
import { formatCompact, formatMoney } from "@/lib/format"
import { nomineeUrl, pageMeta } from "@/lib/seo"
import { nomineeShareUrl } from "@/lib/share"
import { cn } from "@/lib/utils"
import type { BallotNominee, CategoryBallot } from "@/lib/api/types"
import { useTrackView } from "@/hooks/use-track-view"
import { VoteSheet } from "@/components/vote/vote-sheet"
import { VoteFooter } from "@/components/vote/vote-footer"
import { StatusBanner } from "@/components/vote/status-banner"
import { ShareButton } from "@/components/vote/share-button"
import { RouteError } from "@/components/vote/route-states"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute(
  "/$organizationCode/$campaignSlug/$categoryId/$nomineeSlug",
)({
  loader: async ({ context, params }) => {
    let ballot: CategoryBallot
    try {
      ballot = await context.queryClient.ensureQueryData(
        ballotQuery(params.categoryId),
      )
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }

    const nominee = ballot.nominees.find((n) => n.slug === params.nomineeSlug)
    if (!nominee) throw notFound()

    return { ballot, nominee }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const { ballot, nominee } = loaderData
    // The nominee's own name and photo lead the link preview, so a shared link
    // reads as "vote for this person", not "vote in this category".
    const title = `Vote for ${nominee.displayName} | ${ballot.name}`
    const description =
      nominee.bio ??
      `${nominee.displayName} is nominated for ${ballot.name} in ${ballot.campaign.name}. Every vote cast on this page goes to ${nominee.displayName}.`
    return {
      meta: pageMeta({
        title,
        description,
        image:
          nominee.imageUrl ??
          ballot.imageUrl ??
          ballot.campaign.coverImageUrl ??
          ballot.campaign.logoUrl ??
          undefined,
        url: nomineeUrl(
          params.organizationCode,
          params.campaignSlug,
          params.categoryId,
          params.nomineeSlug,
        ),
      }),
    }
  },
  component: NomineePage,
  errorComponent: RouteError,
})

function NomineePage() {
  const { organizationCode, campaignSlug, categoryId, nomineeSlug } =
    Route.useParams()
  const { data: ballot } = useSuspenseQuery(ballotQuery(categoryId))
  const campaign = ballot.campaign
  const state = getCampaignState(campaign)

  const nominee = ballot.nominees.find((n) => n.slug === nomineeSlug)

  const isFreeCapable = campaign.votingMode !== "PAID"
  const { data: allowance } = useQuery(
    allowanceQuery(categoryId, isFreeCapable && state.canVote),
  )

  useTrackView(campaign.id, { categoryId, nomineeId: nominee?.id })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [justVoted, setJustVoted] = useState(false)

  const { totalVotes, rank } = useMemo(
    () => rankNominee(ballot.nominees, nominee?.id),
    [ballot.nominees, nominee?.id],
  )

  // The ballot can change under a cached page -a nominee withdrawn mid-campaign
  // leaves shared links pointing at a slug that is no longer listed.
  if (!nominee) {
    return (
      <MissingNominee
        organizationCode={organizationCode}
        campaignSlug={campaignSlug}
        categoryId={categoryId}
      />
    )
  }

  const shareUrl = nomineeShareUrl({
    organizationCode,
    campaignSlug,
    categoryId,
    nomineeSlug: nominee.slug,
  })
  const shareText = `Vote for ${nominee.displayName} in ${ballot.name} -${campaign.name}`

  const disqualified = nominee.status === "DISQUALIFIED"
  const canVote = state.canVote && !disqualified
  const freeLeft = isFreeCapable ? (allowance?.remaining ?? 0) : 0
  const others = ballot.nominees.filter((n) => n.id !== nominee.id)
  const metadata = readableMetadata(nominee.metadata)

  return (
    <div style={brandStyle(campaign.brandColor)} className="flex min-h-svh flex-col">
      {/* Sticky nav */}
      <header className="bg-background/85 border-border/60 sticky top-0 z-30 border-b backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Link
            to="/$organizationCode/$campaignSlug/$categoryId"
            params={{ organizationCode, campaignSlug, categoryId }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="max-w-[40vw] truncate">{ballot.name}</span>
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-6">
        {/* Nominee hero */}
        <div className="border-border/70 bg-card overflow-hidden rounded-3xl border shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]">
            {nominee.imageUrl ? (
              <img
                src={nominee.imageUrl}
                alt={nominee.displayName}
                className={cn(
                  "size-full object-cover",
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
                <span className="font-heading text-6xl font-bold text-white/90">
                  {initials(nominee.displayName)}
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

            {ballot.resultsVisible && rank === 1 && totalVotes > 0 ? (
              <span className="bg-primary text-primary-foreground absolute top-4 left-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow">
                <Crown className="size-3.5" />
                Leading
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                Nominated for {ballot.name}
              </p>
              <h1 className="font-heading mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {nominee.displayName}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{campaign.name}</Badge>
              {ballot.resultsVisible ? (
                <>
                  <Badge variant="outline">
                    {formatCompact(nominee.votes ?? 0)}{" "}
                    {(nominee.votes ?? 0) === 1 ? "vote" : "votes"}
                  </Badge>
                  {rank ? (
                    <Badge variant="outline">#{rank} in category</Badge>
                  ) : null}
                </>
              ) : null}
              {canVote && freeLeft > 0 ? (
                <Badge variant="success">
                  <Gift className="size-3" />
                  {freeLeft} free vote{freeLeft === 1 ? "" : "s"} left
                </Badge>
              ) : null}
            </div>

            {metadata.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {metadata.map((entry) => (
                  <span
                    key={entry}
                    className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs font-medium"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            ) : null}

            {nominee.bio ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {nominee.bio}
              </p>
            ) : null}

            {/* Vote + share */}
            {disqualified ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm">
                <Ban className="size-4" />
                {nominee.displayName} has been disqualified from this category.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button
                  size="lg"
                  disabled={!canVote}
                  variant={justVoted ? "secondary" : "default"}
                  onClick={() => setSheetOpen(true)}
                  // flex-1 only from sm: up, where the row is horizontal -in the
                  // mobile column it would set flex-basis on the height axis
                  // and override h-14.
                  className="h-14 text-base font-semibold sm:h-12 sm:flex-1"
                >
                  {justVoted ? (
                    <>
                      <Check className="size-5" />
                      Voted for {firstName(nominee.displayName)}
                    </>
                  ) : (
                    <>
                      <Vote className="size-5" />
                      {canVote
                        ? `Vote for ${firstName(nominee.displayName)}`
                        : "Voting closed"}
                    </>
                  )}
                </Button>
                <ShareButton
                  url={shareUrl}
                  title={shareText}
                  text={shareText}
                  label="Share this page"
                  className="h-14 text-base sm:h-12 sm:w-auto"
                />
              </div>
            )}

            {canVote ? (
              <p className="text-muted-foreground text-center text-xs">
                Every vote cast here goes to {nominee.displayName}
                {campaign.votingMode !== "FREE" && ballot.pricePerVoteMinor > 0
                  ? ` · ${formatMoney(ballot.pricePerVoteMinor, campaign.currency)} per paid vote`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>

        {!state.canVote ? <StatusBanner state={state} className="mt-6" /> : null}

        {/* The nominee's own campaigning tool */}
        {canVote ? (
          <section className="border-primary/25 bg-primary/5 mt-6 rounded-2xl border p-5">
            <h2 className="font-heading font-semibold">Campaigning for votes?</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Share this link on WhatsApp, X or Instagram. It opens straight on{" "}
              {nominee.displayName}'s page, so supporters can't vote for the
              wrong nominee by mistake.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="border-border/70 bg-background text-muted-foreground min-w-0 truncate rounded-lg border px-3 py-2 text-xs sm:flex-1">
                {shareUrl}
              </code>
              <ShareButton
                url={shareUrl}
                title={shareText}
                text={shareText}
                label="Copy link"
                variant="default"
                className="h-12 sm:h-10"
              />
            </div>
          </section>
        ) : null}

        {/* Other nominees */}
        {others.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold">
                Also nominated in {ballot.name}
              </h2>
              <Link
                to="/$organizationCode/$campaignSlug/$categoryId"
                params={{ organizationCode, campaignSlug, categoryId }}
                className="text-primary text-sm font-semibold hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {others.slice(0, 6).map((other) => (
                <Link
                  key={other.id}
                  to="/$organizationCode/$campaignSlug/$categoryId/$nomineeSlug"
                  params={{
                    organizationCode,
                    campaignSlug,
                    categoryId,
                    nomineeSlug: other.slug,
                  }}
                  className="border-border/70 hover:border-primary/40 flex items-center gap-3 rounded-xl border p-2.5 transition-colors"
                >
                  <Avatar
                    src={other.imageUrl}
                    name={other.displayName}
                    className="size-10 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {other.displayName}
                    </p>
                    {ballot.resultsVisible ? (
                      <p className="text-muted-foreground text-xs">
                        {formatCompact(other.votes ?? 0)}{" "}
                        {(other.votes ?? 0) === 1 ? "vote" : "votes"}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <VoteFooter organizationName={undefined} />

      <VoteSheet
        nominee={sheetOpen ? nominee : null}
        ballot={ballot}
        allowance={allowance}
        shareUrl={shareUrl}
        onClose={() => setSheetOpen(false)}
        onVoted={() => setJustVoted(true)}
      />
    </div>
  )
}

/** Shown when a shared link points at a nominee no longer on the ballot. */
function MissingNominee({
  organizationCode,
  campaignSlug,
  categoryId,
}: {
  organizationCode: string
  campaignSlug: string
  categoryId: string
}) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-2xl font-bold">Nominee not found</h1>
      <p className="text-muted-foreground mt-2">
        This nominee is no longer on the ballot. Browse the category to find who
        you're looking for.
      </p>
      <Link
        to="/$organizationCode/$campaignSlug/$categoryId"
        params={{ organizationCode, campaignSlug, categoryId }}
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        View all nominees
      </Link>
    </main>
  )
}

/**
 * Competition ranking within the category: nominees tied on votes share a rank,
 * and disqualified entries are left out of the standings. Mirrors the ranking
 * the results endpoint returns.
 */
function rankNominee(
  nominees: BallotNominee[],
  nomineeId: string | undefined,
): { totalVotes: number; rank: number | null } {
  const totalVotes = nominees.reduce((sum, n) => sum + (n.votes ?? 0), 0)
  if (!nomineeId || totalVotes === 0) return { totalVotes, rank: null }

  const standings = [...nominees]
    .filter((n) => n.status !== "DISQUALIFIED")
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))

  let rank = 0
  let previousVotes: number | null = null

  for (const [index, entry] of standings.entries()) {
    const votes = entry.votes ?? 0
    if (previousVotes === null || votes !== previousVotes) rank = index + 1
    previousVotes = votes
    if (entry.id === nomineeId) return { totalVotes, rank }
  }

  return { totalVotes, rank: null }
}

/** Pull up to four short string/number values from nominee metadata. */
function readableMetadata(metadata: Record<string, unknown> | null): string[] {
  if (!metadata) return []
  const out: string[] = []
  for (const value of Object.values(metadata)) {
    if (typeof value === "string" && value.trim() && value.length <= 40) {
      out.push(value.trim())
    } else if (typeof value === "number") {
      out.push(String(value))
    }
    if (out.length === 4) break
  }
  return out
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}
