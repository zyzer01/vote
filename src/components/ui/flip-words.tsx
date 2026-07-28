import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Cycles through `words` with a short fade/rise.
 *
 * Deliberately CSS-driven and single-element: this sits inside the LCP heading,
 * so it must render its first word in the SSR markup (no opacity:0 wait for
 * hydration) and must not schedule per-letter work on every cycle.
 */
export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[]
  duration?: number
  className?: string
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      duration,
    )
    return () => clearInterval(id)
  }, [words.length, duration])

  return (
    <span
      className={cn(
        "relative z-10 inline-grid px-2 text-left text-neutral-900 dark:text-neutral-100",
        className,
      )}
    >
      {/* Widest word, hidden - reserves the box so the headline never reflows. */}
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 whitespace-nowrap"
      >
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <span
        key={index}
        className="col-start-1 row-start-1 animate-fade-up whitespace-nowrap"
      >
        {words[index]}
      </span>
    </span>
  )
}
