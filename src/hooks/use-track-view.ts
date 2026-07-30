import { useEffect, useRef } from "react"

import { trackPageView } from "@/lib/api/voting"
import { getUtmParams, getVisitorId } from "@/lib/visitor"

/**
 * Fires a single page-view for a campaign after mount (client-only, fire and
 * forget). De-duped per campaign id so re-renders don't double count.
 */
export function useTrackView(
  campaignId: string | undefined,
  extra?: { categoryId?: string; nomineeId?: string },
) {
  const sent = useRef<string | null>(null)

  useEffect(() => {
    if (!campaignId) return
    const key = `${campaignId}:${extra?.categoryId ?? ""}:${extra?.nomineeId ?? ""}`
    if (sent.current === key) return
    sent.current = key

    trackPageView(campaignId, {
      visitorId: getVisitorId(),
      categoryId: extra?.categoryId,
      nomineeId: extra?.nomineeId,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      ...getUtmParams(),
    }).catch(() => {
      // Analytics is best-effort; never surface tracking failures.
    })
  }, [campaignId, extra?.categoryId, extra?.nomineeId])
}
