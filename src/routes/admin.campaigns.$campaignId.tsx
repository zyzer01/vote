import { useState } from "react"
import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
  useRouterState,
} from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Layers,
  MoreHorizontal,
  Pause,
  Play,
  Receipt,
  Rocket,
  Settings,
  Square,
  Trash2,
  Trophy,
} from "lucide-react"

import { campaignDetailQuery } from "@/lib/api/admin-queries"
import { ApiError } from "@/lib/api/client"
import type { AdminCampaignDetail } from "@/lib/api/admin-types"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { useCampaignActions } from "@/hooks/use-campaign-actions"
import { CampaignStatusBadge } from "@/components/admin/campaign-status-badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RouteError } from "@/components/vote/route-states"

export const Route = createFileRoute("/admin/campaigns/$campaignId")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(
        campaignDetailQuery(params.campaignId),
      )
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) throw notFound()
      throw error
    }
  },
  pendingComponent: DetailPending,
  errorComponent: RouteError,
  component: CampaignDetailLayout,
})

const TABS = [
  { key: "index", label: "Overview", icon: BarChart3, to: "." as const },
  { key: "categories", label: "Categories", icon: Layers },
  { key: "orders", label: "Orders", icon: Receipt },
  { key: "settings", label: "Settings", icon: Settings },
]

function CampaignDetailLayout() {
  const { campaignId } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(campaignDetailQuery(campaignId))
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const base = `/admin/campaigns/${campaignId}`
  const activeTab =
    pathname === base || pathname === `${base}/`
      ? "index"
      : pathname.split("/")[4] ?? "index"

  return (
    <div>
      <Link
        to="/admin"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft className="size-4" />
        Campaigns
      </Link>

      <CampaignHeader campaign={campaign} />

      {/* Tabs */}
      <div className="border-border mt-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => {
          const active = tab.key === activeTab
          const to = tab.key === "index" ? base : `${base}/${tab.key}`
          return (
            <Link
              key={tab.key}
              to={to}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}

function CampaignHeader({ campaign }: { campaign: AdminCampaignDetail }) {
  const actions = useCampaignActions(campaign.id)
  const [confirm, setConfirm] = useState<null | "close" | "delete">(null)

  const publicPath = `/${campaign.organization.code}/${campaign.slug}`

  const status = campaign.status
  const busy =
    actions.publish.isPending ||
    actions.pause.isPending ||
    actions.close.isPending

  return (
    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        {campaign.logoUrl ? (
          <img
            src={campaign.logoUrl}
            alt=""
            className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <div className="bg-brand-navy text-brand-yellow grid size-14 shrink-0 place-items-center rounded-2xl">
            <Trophy className="size-6" />
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <CampaignStatusBadge status={status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {campaign.organization.name} · Closes {formatDate(campaign.closesAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {status === "PUBLISHED" || status === "CLOSED" ? (
          <a href={publicPath} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="size-4" />
              View page
            </Button>
          </a>
        ) : null}

        {status === "DRAFT" ? (
          <Button
            size="sm"
            className="font-semibold"
            onClick={() => actions.publish.mutate()}
            disabled={busy}
          >
            {actions.publish.isPending ? <Spinner /> : <Rocket className="size-4" />}
            Publish
          </Button>
        ) : null}

        {status === "PUBLISHED" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => actions.pause.mutate()}
            disabled={busy}
          >
            {actions.pause.isPending ? <Spinner /> : <Pause className="size-4" />}
            Pause
          </Button>
        ) : null}

        {status === "PAUSED" ? (
          <Button
            size="sm"
            className="font-semibold"
            onClick={() => actions.publish.mutate()}
            disabled={busy}
          >
            {actions.publish.isPending ? <Spinner /> : <Play className="size-4" />}
            Resume
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon-sm" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent>
            {status === "PUBLISHED" || status === "PAUSED" ? (
              <DropdownMenuItem onClick={() => setConfirm("close")}>
                <Square className="size-4" />
                Close campaign
              </DropdownMenuItem>
            ) : null}
            {status === "DRAFT" ? (
              <DropdownMenuItem
                render={
                  <Link
                    to="/admin/campaigns/$campaignId/settings"
                    params={{ campaignId: campaign.id }}
                  />
                }
              >
                <Settings className="size-4" />
                Edit details
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirm("delete")}
            >
              <Trash2 className="size-4" />
              Delete campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirm === "close"}
        onClose={() => setConfirm(null)}
        onConfirm={() => actions.close.mutate(undefined, { onSuccess: () => setConfirm(null) })}
        loading={actions.close.isPending}
        title="Close this campaign?"
        description="Voting will stop and results will be frozen. This can't be undone."
        confirmLabel="Close campaign"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => actions.remove.mutate()}
        loading={actions.remove.isPending}
        destructive
        title="Delete this campaign?"
        description="This permanently deletes the campaign. Campaigns with paid votes are archived instead."
        confirmLabel="Delete"
      />
    </div>
  )
}

function DetailPending() {
  return (
    <div>
      <Skeleton className="h-5 w-24" />
      <div className="mt-3 flex items-center gap-4">
        <Skeleton className="size-14 rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="mt-6 h-10 w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
