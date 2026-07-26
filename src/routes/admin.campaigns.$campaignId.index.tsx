import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Banknote, Eye, TrendingUp, Trophy, Vote } from "lucide-react"

import { analyticsQuery, campaignDetailQuery } from "@/lib/api/admin-queries"
import { formatCompact, formatMoney, formatNumber } from "@/lib/format"
import { StatCard } from "@/components/admin/stat-card"
import { TrendChart } from "@/components/admin/trend-chart"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/admin/campaigns/$campaignId/")({
  component: OverviewPage,
})

const GREEN = "oklch(0.6907 0.1828 151.72)"
const NAVY = "oklch(0.4 0.13 264)"
const YELLOW = "oklch(0.78 0.14 85)"

function OverviewPage() {
  const { campaignId } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(campaignDetailQuery(campaignId))
  const { data, isLoading } = useQuery(analyticsQuery(campaignId))

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
        <Skeleton className="h-72 rounded-2xl sm:col-span-2 lg:col-span-4" />
      </div>
    )
  }

  const { totals, rates, timeseries, topNominees, trafficSources } = data
  const currency = totals.currency
  const isPaid = campaign.votingMode !== "FREE"

  const dates = timeseries.map((p) => p.date)

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Page views"
          value={formatNumber(totals.pageViews)}
          sub={`${formatNumber(totals.uniqueVisitors)} unique visitors`}
          icon={Eye}
          accent="navy"
        />
        <StatCard
          index={1}
          label="Votes cast"
          value={formatNumber(totals.votes)}
          sub={`${formatNumber(totals.paidVotes)} paid · ${formatNumber(totals.freeVotes)} free`}
          icon={Vote}
          accent="primary"
        />
        <StatCard
          index={2}
          label={isPaid ? "Net revenue" : "Free votes"}
          value={
            isPaid
              ? formatMoney(totals.netRevenueMinor, currency)
              : formatNumber(totals.freeVotes)
          }
          sub={
            isPaid
              ? `${formatMoney(totals.grossRevenueMinor, currency)} gross`
              : "No paid votes"
          }
          icon={Banknote}
          accent="yellow"
        />
        <StatCard
          index={3}
          label="View → vote rate"
          value={`${rates.viewToVotePercent}%`}
          sub={
            isPaid
              ? `${rates.checkoutCompletionPercent}% checkout completion`
              : "Share of visitors who voted"
          }
          icon={TrendingUp}
          accent="red"
        />
      </div>

      {/* Trend */}
      <div className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm">
        <h2 className="font-heading font-semibold">Activity over time</h2>
        <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
          Views and votes across the reporting window.
        </p>
        <TrendChart
          dates={dates}
          series={[
            {
              label: "Page views",
              color: NAVY,
              values: timeseries.map((p) => p.pageViews),
            },
            {
              label: "Votes",
              color: GREEN,
              values: timeseries.map((p) => p.votes),
            },
          ]}
          formatValue={formatCompact}
        />
      </div>

      {isPaid ? (
        <div className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm">
          <h2 className="font-heading font-semibold">Revenue</h2>
          <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
            Gross revenue collected per day.
          </p>
          <TrendChart
            dates={dates}
            series={[
              {
                label: `Revenue (${currency})`,
                color: YELLOW,
                values: timeseries.map((p) => p.grossRevenueMinor / 100),
              },
            ]}
            formatValue={(n) => formatMoney(n * 100, currency)}
          />
        </div>
      ) : null}

      {/* Two-column: top nominees + traffic */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm">
          <h2 className="font-heading font-semibold">Top nominees</h2>
          {topNominees.length === 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">
              No votes recorded yet.
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {topNominees.slice(0, 8).map((nominee, i) => (
                <li key={nominee.nomineeId} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-4 text-sm font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  {nominee.imageUrl ? (
                    <img
                      src={nominee.imageUrl}
                      alt=""
                      className="size-9 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="bg-muted text-muted-foreground grid size-9 place-items-center rounded-lg">
                      <Trophy className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {nominee.displayName}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatNumber(nominee.votes)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="border-border/70 bg-card rounded-2xl border p-5 shadow-sm">
          <h2 className="font-heading font-semibold">Traffic sources</h2>
          {trafficSources.length === 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">
              No traffic recorded yet.
            </p>
          ) : (
            <TrafficBars sources={trafficSources} />
          )}
        </div>
      </div>
    </div>
  )
}

function TrafficBars({
  sources,
}: {
  sources: Array<{ source: string; views: number }>
}) {
  const max = Math.max(1, ...sources.map((s) => s.views))
  return (
    <div className="mt-4 flex flex-col gap-3">
      {sources.slice(0, 8).map(({ source, views }) => (
        <div key={source}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate font-medium capitalize">{source}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatNumber(views)}
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(views / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
