import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip  } from "@/components/ui/chart"
import type {ChartConfig} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Info } from "lucide-react"
import { formatNaira } from "@/lib/format"
import { useWallet } from "../hooks/use-wallet"
import { useWalletBalanceHistory } from "../hooks/use-balance-history"
import type { BalanceHistoryRange } from "../interfaces/wallet"
import { cn } from "@/lib/utils"

const RANGE_OPTIONS: { value: BalanceHistoryRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
]

/** Matches primary balance accent (e.g. Available Balance card ~ blue-400) */
const CHART_LINE_GREEN = "#00b966"

const chartConfig = {
  balance: {
    label: "Balance",
    color: CHART_LINE_GREEN,
  },
} satisfies ChartConfig

function formatAxisDate(isoDate: string) {
  try {
    return format(parseISO(isoDate), "MMM dd")
  } catch {
    return isoDate
  }
}

function formatTooltipDate(isoDate: string) {
  try {
    return format(parseISO(isoDate), "MMM d, yyyy")
  } catch {
    return isoDate
  }
}

export function WalletBalanceHistoryChart({
  voteOrganizationId,
}: {
  voteOrganizationId: string
}) {
  const [range, setRange] = useState<BalanceHistoryRange>("30d")
  const [hideBalance, setHideBalance] = useState(false)

  const { data: wallet, isLoading: walletLoading } = useWallet(voteOrganizationId)
  const {
    data: history,
    isLoading: historyLoading,
    isError,
    error,
  } = useWalletBalanceHistory(voteOrganizationId, range)

  const chartData = useMemo(() => {
    if (!history?.points.length) return []
    return history.points.map((p) => ({
      ...p,
      label: formatAxisDate(p.date),
    }))
  }, [history?.points])

  const balance = wallet?.balance ?? 0
  const displayBalance = hideBalance ? "••••••" : formatNaira(balance)

  const loading = walletLoading || historyLoading

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <span className="text-xs font-medium tracking-wide uppercase">Total balance</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground inline-flex"
                      aria-label="About total balance"
                    >
                      <Info className="size-3.5" />
                    </button>
                  }
                />
                <TooltipContent className="max-w-xs text-xs">
                  Current wallet balance and daily closing balance over the selected period
                  (UTC days).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            {walletLoading ? (
              <Skeleton className="h-9 w-36" />
            ) : (
              <span className="text-2xl font-bold tracking-tight tabular-nums">
                {displayBalance}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-8 shrink-0"
              onClick={() => setHideBalance((v) => !v)}
              aria-label={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>
          </div>
        </div>

        <Select value={range} onValueChange={(v) => setRange(v as BalanceHistoryRange)}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {isError && (
          <p className="text-destructive mb-2 text-sm">
            {error instanceof Error ? error.message : "Failed to load chart"}
          </p>
        )}

        {loading ? (
          <Skeleton className="h-[min(320px,45vh)] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="border-muted-foreground/25 flex h-[min(280px,40vh)] w-full items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground text-sm">
              No balance history for this period
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto h-[min(320px,45vh)] min-h-[260px] w-full min-w-0")}
          >
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
              accessibilityLayer
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                tickFormatter={(v) => formatAxisDate(String(v))}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={56}
                tickFormatter={(v) =>
                  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`
                }
              />
              <ChartTooltip
                cursor={{ stroke: "var(--color-balance)", strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload as {
                    date?: string
                    balance?: number
                  }
                  const dateStr = row.date
                  const dateLabel = dateStr ? formatTooltipDate(dateStr) : ""
                  const amount = Number(payload[0].value ?? row.balance ?? 0)
                  return (
                    <div className="border-border/50 bg-background grid min-w-36 gap-1 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                      {dateLabel ? (
                        <div className="text-muted-foreground font-medium">{dateLabel}</div>
                      ) : null}
                      <div className="text-foreground font-semibold tabular-nums">
                        {formatNaira(amount)}
                      </div>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "var(--color-balance)" }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
