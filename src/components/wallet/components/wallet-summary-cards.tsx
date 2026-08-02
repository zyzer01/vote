import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { useWallet, useWalletTransactionTotals } from "../hooks/use-wallet"
import { useAuth } from "@/lib/auth"
import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export function WalletSummaryCards({ sidePanel }: { sidePanel?: boolean }) {
  const { voteOrganizationId } = useAuth()

  const { isLoading, isError, error } = useWallet(voteOrganizationId || "")
  const {
    data: totalsData,
    isLoading: totalsLoading,
    isError: totalsError,
  } = useWalletTransactionTotals(voteOrganizationId || "")

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    variant = "default",
    onClick,
    isLoading: cardLoading,
    className,
    footer,
  }: {
    icon: any
    title: string
    value: string
    subtitle?: string
    trend?: string
    variant?: "default" | "primary" | "success" | "warning"
    onClick?: () => void
    isLoading?: boolean
    className?: string
    footer?: ReactNode
  }) => {
    if (cardLoading) {
      return (
        <Card
          className={cn(
            "relative min-w-0 overflow-hidden py-4 transition-shadow duration-200 hover:shadow-lg",
            className,
          )}
        >
          <CardContent className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex min-w-0 items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mb-2 h-8 w-20 sm:h-9 sm:w-24" />
                <Skeleton className="h-3 w-24 sm:w-32" />
              </div>
            </div>
          </CardContent>
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 bg-linear-to-t from-primary/10 to-transparent" />
        </Card>
      )
    }

    return (
      <Card
        className={cn(
          "min-w-0 py-0 transition-all duration-200",
          onClick
            ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]"
            : "hover:shadow-lg",
          variant === "primary" && "border-primary/30 bg-primary/10",
          className,
        )}
        onClick={onClick}
      >
        <CardContent className="px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs sm:mb-2 sm:text-sm">
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="truncate">{title}</span>
              </div>
              <div className="mb-1 wrap-break-word text-xl font-bold sm:text-2xl">
                {value}
              </div>
              {subtitle && (
                <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
              )}
            </div>
          </div>
          {footer ? (
            <div className="border-border/60 mt-3 border-t pt-3">{footer}</div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <div className="mb-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load wallet information"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const revenueSpan = sidePanel ? "sm:col-span-2" : "sm:col-span-2 xl:col-span-4"

  const revenueValue = totalsError ? "—" : formatNaira(totalsData?.allTimeRevenue ?? 0)
  const debitsValue = totalsError ? "—" : formatNaira(totalsData?.totalDebits ?? 0)
  const pendingWithdrawalsValue = totalsError
    ? "—"
    : formatNaira(totalsData?.pendingWithdrawalsAmount ?? 0)

  return (
    <div
      className={cn(
        "mb-6 grid gap-3 sm:gap-4",
        sidePanel
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
      )}
    >
      <StatCard
        className={revenueSpan}
        icon={TrendingUp}
        title="All time revenue"
        value={revenueValue}
        subtitle="Total completed credits to your wallet"
        variant="primary"
        isLoading={isLoading || totalsLoading}
      />

      <StatCard
        icon={TrendingDown}
        title="Total Debits"
        value={debitsValue}
        subtitle="All-time debits"
        isLoading={isLoading || totalsLoading}
      />

      <StatCard
        icon={Clock}
        title="Pending Withdrawals"
        value={pendingWithdrawalsValue}
        subtitle="Gross amount awaiting completion"
        isLoading={isLoading || totalsLoading}
        footer={
          <Link
            to="/admin/wallet/withdrawals"
            className="text-foreground text-xs font-medium underline-offset-4 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View withdrawals
          </Link>
        }
      />
    </div>
  )
}
