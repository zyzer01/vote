import { useEffect, useState } from "react"

import { timeUntil } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Live-ticking countdown with flip-in digits. Renders null once it hits zero. */
export function Countdown({
  to,
  label,
  className,
  tone = "onDark",
  onComplete,
}: {
  to: string
  label?: string | null
  className?: string
  tone?: "onDark" | "onLight"
  onComplete?: () => void
}) {
  const tileClass =
    tone === "onDark"
      ? "bg-white/12 backdrop-blur-sm"
      : "bg-muted border border-border"
  const [remaining, setRemaining] = useState(() => timeUntil(to))

  useEffect(() => {
    const tick = () => {
      const next = timeUntil(to)
      setRemaining(next)
      if (next.total <= 0) onComplete?.()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [to, onComplete])

  if (remaining.total <= 0) return null

  const units = [
    { value: remaining.days, label: "Days" },
    { value: remaining.hours, label: "Hrs" },
    { value: remaining.minutes, label: "Min" },
    { value: remaining.seconds, label: "Sec" },
  ]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {label ? (
        <span className="text-xs font-medium tracking-wide uppercase opacity-70">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative grid h-12 w-12 place-items-center overflow-hidden rounded-xl font-mono text-xl font-bold tabular-nums sm:h-14 sm:w-14 sm:text-2xl",
                  tileClass,
                )}
              >
                <FlipDigit value={unit.value} />
              </div>
              <span className="mt-1.5 text-[0.62rem] font-medium tracking-wide uppercase opacity-60">
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 ? (
              <span className="-mt-4 text-lg opacity-40">:</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function FlipDigit({ value }: { value: number }) {
  const text = String(value).padStart(2, "0")
  return (
    <span key={text} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {text}
    </span>
  )
}
