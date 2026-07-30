export const SITE_URL = "https://vote.sportly.africa"
export const SITE_TITLE = "Sportly Vote"
export const SITE_DESCRIPTION =
  "Run world-class voting campaigns. Vote for your favourites and follow the results live on Sportly."
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export function campaignUrl(organizationCode: string, campaignSlug: string) {
  return `${SITE_URL}/${organizationCode}/${campaignSlug}`
}

export function categoryUrl(
  organizationCode: string,
  campaignSlug: string,
  categoryId: string,
) {
  return `${campaignUrl(organizationCode, campaignSlug)}/${categoryId}`
}

/** Canonical URL of a nominee's own page -what shared links resolve to. */
export function nomineeUrl(
  organizationCode: string,
  campaignSlug: string,
  categoryId: string,
  nomineeSlug: string,
) {
  return `${categoryUrl(organizationCode, campaignSlug, categoryId)}/${nomineeSlug}`
}

const TITLE_MAX_LENGTH = 70
const DESCRIPTION_MAX_LENGTH = 160

/**
 * Truncates at the last word boundary before maxLength rather than mid-word,
 * so social/search platforms that also truncate don't compound it into a cut
 * that ends mid-syllable.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Shared meta/OG/Twitter tags for a page. Child routes call this with their
 * own title/description/image/url; TanStack Router matches tags by
 * name/property across the route tree, so these override the root's
 * site-wide defaults rather than duplicating them.
 */
export function pageMeta({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url,
  siteName = SITE_TITLE,
}: {
  title: string
  description: string
  image?: string
  url: string
  siteName?: string
}) {
  const truncatedTitle = truncate(title, TITLE_MAX_LENGTH)
  const truncatedDescription = truncate(description, DESCRIPTION_MAX_LENGTH)

  return [
    { title: truncatedTitle },
    { name: "description", content: truncatedDescription },

    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: truncatedTitle },
    { property: "og:description", content: truncatedDescription },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: truncatedTitle },
    { name: "twitter:description", content: truncatedDescription },
    { name: "twitter:image", content: image },
  ]
}
