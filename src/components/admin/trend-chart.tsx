import { useId } from "react"
import { motion } from "motion/react"

import { formatDate } from "@/lib/format"

export interface TrendSeries {
  label: string
  color: string
  values: number[]
}

/**
 * Lightweight multi-series area chart drawn as inline SVG -no chart library.
 * Uses a fixed viewBox and scales to its container via preserveAspectRatio.
 */
export function TrendChart({
  dates,
  series,
  height = 220,
  formatValue = (n) => n.toLocaleString(),
}: {
  dates: string[]
  series: TrendSeries[]
  height?: number
  formatValue?: (n: number) => string
}) {
  const gradientId = useId()
  const W = 640
  const H = 220
  const padX = 8
  const padTop = 12
  const padBottom = 22

  const allValues = series.flatMap((s) => s.values)
  const max = Math.max(1, ...allValues)
  const count = dates.length

  const x = (i: number) =>
    count <= 1 ? W / 2 : padX + (i * (W - padX * 2)) / (count - 1)
  const y = (v: number) =>
    padTop + (1 - v / max) * (H - padTop - padBottom)

  const linePath = (values: number[]) =>
    values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(" ")

  const areaPath = (values: number[]) =>
    `${linePath(values)} L ${x(count - 1).toFixed(1)} ${H - padBottom} L ${x(0).toFixed(1)} ${H - padBottom} Z`

  if (count === 0) {
    return (
      <div
        className="text-muted-foreground grid place-items-center text-sm"
        style={{ height }}
      >
        No activity in this range yet.
      </div>
    )
  }

  // A few evenly spaced date ticks.
  const tickIdx = Array.from(
    new Set([0, Math.floor(count / 2), count - 1].filter((i) => i >= 0)),
  )

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground font-medium">{s.label}</span>
          </div>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* baseline grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={W - padX}
            y1={padTop + f * (H - padTop - padBottom)}
            y2={padTop + f * (H - padTop - padBottom)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {series.map((s, si) => (
          <g key={s.label}>
            <defs>
              <linearGradient
                id={`${gradientId}-${si}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={areaPath(s.values)} fill={`url(#${gradientId}-${si})`} />
            <motion.path
              d={linePath(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>

      {/* date ticks (HTML so text stays crisp under non-uniform scaling) */}
      <div className="text-muted-foreground mt-1 flex justify-between text-[11px]">
        {tickIdx.map((i) => (
          <span key={i}>{formatDate(dates[i])}</span>
        ))}
      </div>
      <div className="text-muted-foreground mt-1 text-right text-xs">
        Peak {formatValue(max)}
      </div>
    </div>
  )
}
