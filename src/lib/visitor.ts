/**
 * First-party visitor id for analytics de-duplication. Stored in localStorage
 * so the same browser reports a stable id across page views. Server-safe: falls
 * back to a throwaway id during SSR (page-view tracking runs client-side).
 */
const KEY = "sportly.vote.vid"

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "")
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return randomId()
  try {
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = randomId()
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return randomId()
  }
}

/** UTM params from the current URL, for attributing traffic sources. */
export function getUtmParams(): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
} {
  if (typeof window === "undefined") return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  }
}
