import { createFileRoute, notFound, Link  } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { BarChart3 } from "lucide-react"

import { campaignQuery } from "@/lib/api/queries"
import { ApiError } from "@/lib/api/client"
import { brandStyle } from "@/lib/brand"
import { getCampaignState } from "@/lib/campaign-state"
import { campaignUrl, pageMeta } from "@/lib/seo"
import { useTrackView } from "@/hooks/use-track-view"
import { CampaignHero } from "@/components/vote/campaign-hero"
import { CategoryCard } from "@/components/vote/category-card"
import { VoteFooter } from "@/components/vote/vote-footer"
import { ResultsTeaser } from "@/components/vote/results-teaser"
import { CampaignPending, RouteError } from "@/components/vote/route-states"

export const Route = createFileRoute("/$organizationCode/$campaignSlug/")({
  loader: async ({ context, params }) => {
    try {
      const campaign = await context.queryClient.ensureQueryData(
        campaignQuery(params.organizationCode, params.campaignSlug),
      )
      return { campaign }
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const { campaign } = loaderData
    const title = `${campaign.name} | Vote now`
    const description =
      campaign.description ??
      `Vote for your favourites in ${campaign.name}, hosted by ${campaign.voteOrganization.name} on Sportly Vote.`
    return {
      meta: pageMeta({
        title,
        description,
        image: campaign.coverImageUrl ?? campaign.logoUrl ?? undefined,
        url: campaignUrl(params.organizationCode, params.campaignSlug),
      }),
    }
  },
  component: CampaignPage,
  pendingComponent: CampaignPending,
  errorComponent: RouteError,
})

function CampaignPage() {
  const { organizationCode, campaignSlug } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(
    campaignQuery(organizationCode, campaignSlug),
  )

  useTrackView(campaign.id)
  const state = getCampaignState(campaign)

  return (
    <div style={brandStyle(campaign.brandColor)} className="flex min-h-svh flex-col">
      <CampaignHero campaign={campaign} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5">
        {/* Categories */}
        <section id="categories" className="scroll-mt-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Choose a category
              </h2>
              <p className="text-muted-foreground mt-1">
                {state.canVote
                  ? "Pick a category, then vote for your favourite nominee."
                  : "Browse the nominees across every category."}
              </p>
            </div>
            {campaign.resultsVisibility === "LIVE" ? (
              <Link
                to="/$organizationCode/$campaignSlug/results"
                params={{ organizationCode, campaignSlug }}
                className="text-foreground mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline sm:mt-0"
              >
                <BarChart3 className="size-4" />
                Live results
              </Link>
            ) : null}
          </div>

          {campaign.categories.length === 0 ? (
            <div className="border-border/70 text-muted-foreground mt-8 rounded-2xl border border-dashed p-12 text-center">
              Categories are being finalised. Please check back soon.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {campaign.categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  campaign={campaign}
                  organizationCode={organizationCode}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

       

        {/* Results teaser */}
        <ResultsTeaser
          campaign={campaign}
          organizationCode={organizationCode}
        />
      </main>

      <VoteFooter organizationName={campaign.voteOrganization.name} />
    </div>
  )
}
