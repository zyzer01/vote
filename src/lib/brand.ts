import type { CSSProperties } from "react"

/**
 * Turns a campaign's `brandColor` into CSS-variable overrides so the whole page
 * re-themes to the organizer's colour. We only override the primary/accent
 * hooks and derive a readable foreground from the colour's perceived
 * brightness. When no brand colour is set we return an empty object and the app
 * keeps the Sportly green.
 */
export function brandStyle(brandColor?: string | null): CSSProperties {
  if (!brandColor) return {}
  const foreground = readableForeground(brandColor)
  return {
    "--primary": brandColor,
    "--primary-foreground": foreground,
    "--ring": brandColor,
    "--sidebar-primary": brandColor,
    "--brand": brandColor,
  } as CSSProperties
}

/** Black or white text for best contrast on a hex background. */
function readableForeground(color: string): string {
  const hex = color.trim().replace("#", "")
  if (hex.length !== 3 && hex.length !== 6) return "#ffffff"
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return "#ffffff"
  // Relative luminance (sRGB) → pick dark text on light colours.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? "#0B1220" : "#ffffff"
}
