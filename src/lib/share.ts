/**
 * Link sharing for nominee pages.
 *
 * Every nominee has a page of their own, so they can hand out a link that
 * lands voters directly on them -no scrolling a long ballot and no voting for
 * the wrong "John" by mistake.
 */
import { SITE_URL } from "./seo"

export interface NomineeLinkParams {
  organizationCode: string
  campaignSlug: string
  categoryId: string
  nomineeSlug: string
}

/** Path to a nominee's page, relative to the site root. */
export function nomineePath({
  organizationCode,
  campaignSlug,
  categoryId,
  nomineeSlug,
}: NomineeLinkParams): string {
  const segments = [organizationCode, campaignSlug, categoryId, nomineeSlug]
  return `/${segments.map(encodeURIComponent).join("/")}`
}

/**
 * Absolute URL a nominee can paste anywhere. Always the canonical site origin -
 * the same URL the page advertises as `og:url`, and never a preview or
 * localhost link that would be dead for everyone the nominee sends it to. It
 * also keeps the rendered link identical on the server and the client.
 */
export function nomineeShareUrl(params: NomineeLinkParams): string {
  return `${SITE_URL}${nomineePath(params)}`
}

export type ShareResult = "shared" | "copied" | "dismissed" | "failed"

/**
 * Hands the link to the OS share sheet when one exists (phones, where most
 * nominees will be sharing), otherwise copies it to the clipboard.
 */
export async function shareLink({
  url,
  title,
  text,
}: {
  url: string
  title?: string
  text?: string
}): Promise<ShareResult> {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({ url, title, text })
      return "shared"
    } catch (error) {
      // The user closing the share sheet is not a failure -don't fall through
      // to a clipboard copy they didn't ask for.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "dismissed"
      }
    }
  }

  return (await copyToClipboard(url)) ? "copied" : "failed"
}

/** Clipboard write with a fallback for insecure origins and older browsers. */
export async function copyToClipboard(value: string): Promise<boolean> {
  // `clipboard` is typed as always present but is absent on insecure origins.
  if (typeof navigator !== "undefined" && "clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      /* falls through to the textarea fallback */
    }
  }

  if (typeof document === "undefined") return false

  try {
    const field = document.createElement("textarea")
    field.value = value
    field.setAttribute("readonly", "")
    field.style.position = "fixed"
    field.style.opacity = "0"
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand("copy")
    document.body.removeChild(field)
    return copied
  } catch {
    return false
  }
}
