import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Lock, Receipt, Search } from "lucide-react"

import { campaignDetailQuery, ordersQuery } from "@/lib/api/admin-queries"
import { ApiError } from "@/lib/api/client"
import type { AdminOrder, VoteOrderStatus } from "@/lib/api/admin-types"
import { cn } from "@/lib/utils"
import { formatDateTime, formatMoney } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/admin/campaigns/$campaignId/orders")({
  component: OrdersPage,
})

const STATUS_FILTERS: Array<{ label: string; value: VoteOrderStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
]

const STATUS_VARIANT: Record<
  VoteOrderStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "destructive",
  ABANDONED: "secondary",
  REVERSED: "outline",
}

function OrdersPage() {
  const { campaignId } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(campaignDetailQuery(campaignId))
  const isPaid = campaign.votingMode !== "FREE"

  const [status, setStatus] = useState<VoteOrderStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    ...ordersQuery(campaignId, {
      status: status === "ALL" ? undefined : status,
      search: search.trim() || undefined,
      page,
      limit: 20,
    }),
    placeholderData: keepPreviousData,
  })

  if (!isPaid) {
    return (
      <EmptyBlock
        title="No orders"
        body="This is a free campaign, so there are no paid vote orders."
      />
    )
  }

  if (error instanceof ApiError && error.status === 403) {
    return (
      <EmptyBlock
        icon={Lock}
        title="Restricted"
        body="Only campaign owners and admins can view the revenue and order log."
      />
    )
  }

  const orders = data?.items ?? []
  const meta = data?.meta

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value)
                setPage(1)
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                status === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Email, name or reference…"
            className="h-10 pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border-border/70 bg-card mt-5 overflow-hidden rounded-2xl border shadow-sm">
        {isLoading ? (
          <div className="flex flex-col gap-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-none" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-muted-foreground grid place-items-center py-16 text-sm">
            No orders match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-left text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Voter</th>
                  <th className="px-4 py-3 font-medium">Nominee</th>
                  <th className="px-4 py-3 text-right font-medium">Votes</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.totalPages} · {meta.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OrderRow({ order }: { order: AdminOrder }) {
  return (
    <tr className="border-border/60 hover:bg-muted/40 border-b transition-colors last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium">{order.voterName || "—"}</div>
        <div className="text-muted-foreground text-xs">
          {order.voterEmail || "No email"}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{order.nominee?.displayName ?? "—"}</div>
        <div className="text-muted-foreground text-xs">
          {order.category?.name ?? ""}
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{order.quantity}</td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">
        {formatMoney(order.amountMinor, order.currency)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </td>
      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
        {formatDateTime(order.createdAt)}
      </td>
    </tr>
  )
}

function EmptyBlock({
  title,
  body,
  icon: Icon = Receipt,
}: {
  title: string
  body: string
  icon?: typeof Receipt
}) {
  return (
    <div className="border-border/70 grid place-items-center rounded-2xl border border-dashed py-20 text-center">
      <div className="bg-muted text-muted-foreground grid size-14 place-items-center rounded-2xl">
        <Icon className="size-7" />
      </div>
      <h3 className="font-heading mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{body}</p>
    </div>
  )
}
