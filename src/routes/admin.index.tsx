import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { CalendarDays, Layers, Plus, Search, Trophy, Users } from "lucide-react"

import { campaignsQuery } from "@/lib/api/admin-queries"
import type { AdminCampaignListItem } from "@/lib/api/admin-types"
import type { CampaignStatus } from "@/lib/api/types"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CampaignStatusBadge,
  VotingModeBadge,
} from "@/components/admin/campaign-status-badge"

export const Route = createFileRoute("/admin/")({
  component: CampaignsPage,
})

const FILTERS: Array<{ label: string; value: CampaignStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Live", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Paused", value: "PAUSED" },
  { label: "Closed", value: "CLOSED" },
]

function CampaignsPage() {
  const { organizationId } = useAuth()
  const [filter, setFilter] = useState<CampaignStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")

  const { data, isLoading, isError } = useQuery({
    ...campaignsQuery(organizationId, {
      status: filter === "ALL" ? undefined : filter,
      search: search.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const campaigns = data?.items ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your voting campaigns.
          </p>
        </div>
        <Link to="/admin/campaigns/new">
          <Button size="lg" className="font-semibold">
            <Plus className="size-4" />
            New campaign
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="h-10 pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <CardGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </CardGrid>
        ) : isError ? (
          <EmptyState
            title="Couldn't load campaigns"
            body="Something went wrong. Please refresh and try again."
          />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title={search || filter !== "ALL" ? "No matching campaigns" : "No campaigns yet"}
            body={
              search || filter !== "ALL"
                ? "Try a different search or filter."
                : "Create your first voting campaign to get started."
            }
            action={
              !search && filter === "ALL" ? (
                <Link to="/admin/campaigns/new">
                  <Button className="font-semibold">
                    <Plus className="size-4" />
                    New campaign
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <CardGrid>
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  )
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  )
}

function CampaignCard({
  campaign,
  index,
}: {
  campaign: AdminCampaignListItem
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to="/admin/campaigns/$campaignId"
        params={{ campaignId: campaign.id }}
        className="group border-border/70 bg-card block overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Cover */}
        <div className="relative h-28 overflow-hidden">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background: campaign.brandColor
                  ? `linear-gradient(135deg, ${campaign.brandColor}, color-mix(in oklch, ${campaign.brandColor}, black 45%))`
                  : "linear-gradient(135deg, var(--color-brand-navy), var(--color-brand-navy-800))",
              }}
            />
          )}
          <div className="absolute top-3 right-3">
            <CampaignStatusBadge status={campaign.status} />
          </div>
          {campaign.logoUrl ? (
            <img
              src={campaign.logoUrl}
              alt=""
              className="border-background bg-background absolute -bottom-5 left-4 size-12 rounded-xl border-2 object-cover shadow-sm"
            />
          ) : (
            <div className="border-background bg-brand-navy text-brand-yellow absolute -bottom-5 left-4 grid size-12 place-items-center rounded-xl border-2 shadow-sm">
              <Trophy className="size-5" />
            </div>
          )}
        </div>

        <div className="p-4 pt-7">
          <h3 className="font-heading truncate font-semibold">{campaign.name}</h3>
          <div className="mt-1.5 flex items-center gap-2">
            <VotingModeBadge mode={campaign.votingMode} />
          </div>

          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-3.5" />
              {campaign._count.categories} categor
              {campaign._count.categories === 1 ? "y" : "ies"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {campaign._count.nominees} nominee
              {campaign._count.nominees === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(campaign.closesAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="border-border/70 grid place-items-center rounded-2xl border border-dashed py-20 text-center">
      <div className="bg-muted text-muted-foreground grid size-14 place-items-center rounded-2xl">
        <Trophy className="size-7" />
      </div>
      <h3 className="font-heading mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
