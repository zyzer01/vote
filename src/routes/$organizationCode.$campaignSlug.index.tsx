import { createFileRoute, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { BarChart3, CreditCard, MousePointerClick, Trophy } from "lucide-react"

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
import { Link } from "@tanstack/react-router"

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
      `Vote for your favourites in ${campaign.name}, hosted by ${campaign.organization.name} on Sportly Vote.`
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
                className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline sm:mt-0"
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

        {/* How it works */}
        <HowItWorks isPaid={campaign.votingMode !== "FREE"} />

        {/* Results teaser */}
        <ResultsTeaser
          campaign={campaign}
          organizationCode={organizationCode}
        />
      </main>

      <VoteFooter organizationName={campaign.organization.name} />
    </div>
  )
}

function HowItWorks({ isPaid }: { isPaid: boolean }) {
  const steps = [
    {
      icon: MousePointerClick,
      title: "Pick a category",
      body: "Explore the awards and open the one you care about.",
    },
    {
      icon: Trophy,
      title: "Back your favourite",
      body: "Choose a nominee from the ballot.",
    },
    isPaid
      ? {
          icon: CreditCard,
          title: "Pay & confirm",
          body: "Checkout securely -your votes are counted instantly.",
        }
      : {
          icon: BarChart3,
          title: "Watch it climb",
          body: "See your nominee move up the live leaderboard.",
        },
  ]

  return (
    <section className="mt-20">
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="border-border/70 bg-card relative rounded-2xl border p-5"
          >
            <div className="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl">
              <step.icon className="size-5" />
            </div>
            <span className="text-muted-foreground/50 absolute top-5 right-5 font-mono text-sm font-semibold">
              0{i + 1}
            </span>
            <h3 className="font-heading mt-4 font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
