import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /** Size of the beam (its length along the border), in px. */
  size?: number
  /** How long one full loop takes, in seconds. */
  duration?: number
  /** Negative offset to desync multiple beams, in seconds. */
  delay?: number
  colorFrom?: string
  colorTo?: string
  /** Thickness of the beam ring, in px. */
  borderWidth?: number
  className?: string
}

/**
 * A gradient comet that travels around an element's border. Drop it inside any
 * `relative` + `rounded-*` container; it inherits the radius and rides the edge.
 *
 * Runs as a CSS animation rather than a JS one - this loops forever, and a
 * `repeat: Infinity` motion value keeps a requestAnimationFrame callback alive
 * on the main thread for the life of the page.
 */
export function BorderBeam({
  size = 70,
  duration = 8,
  delay = 0,
  colorFrom = "var(--color-brand-yellow)",
  colorTo = "transparent",
  borderWidth = 1.5,
  className,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={{ border: `${borderWidth}px solid transparent` }}
    >
      <div
        className={cn(
          "absolute aspect-square animate-beam bg-gradient-to-l from-[var(--beam-from)] via-[var(--beam-to)] to-transparent",
          className,
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            animationDelay: `-${delay}s`,
            "--beam-duration": `${duration}s`,
            "--beam-from": colorFrom,
            "--beam-to": colorTo,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
