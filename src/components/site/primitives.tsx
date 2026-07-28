import { cn } from "@/lib/utils"

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground/70 uppercase",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Inline `--reveal-delay` for a staggered entrance, if one was asked for. */
export function revealStyle(delay = 0, extra?: React.CSSProperties) {
  return delay
    ? ({ ...extra, "--reveal-delay": `${delay}s` } as React.CSSProperties)
    : extra
}

/**
 * Fade + rise on scroll into view.
 *
 * Markup only - no ref, no effect. The inline script in `__root.tsx` finds
 * every `[data-reveal]` and flips it to `"in"` as it nears the viewport, which
 * means the reveal works off the SSR HTML instead of waiting for hydration.
 * See the `[data-reveal-ready]` rules in styles.css.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div data-reveal="" style={revealStyle(delay)} className={className}>
      {children}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl text-center items-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="text-base leading-relaxed text-muted-foreground text-balance md:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
