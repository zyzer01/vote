/** Money, date and number formatting. All API money is in minor units (kobo). */

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  GHS: "₵",
  KES: "KSh",
  ZAR: "R",
}

export function currencySymbol(currency = "NGN"): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `
}

/**
 * Coerce an API money value to a number, defaulting to 0. Prisma `Decimal`
 * columns serialize to JSON as strings ("5000.00") even where the API's own
 * types say `number`, so a bare `typeof x === "number"` check silently turns
 * real money into ₦0.00.
 */
function toAmount(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isNaN(value) ? 0 : value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/** Minor units → a display string, e.g. 1_050_000 NGN → "₦10,500". */
export function formatMoney(
  minor: number | string | null | undefined,
  currency = "NGN",
  { showDecimals }: { showDecimals?: boolean } = {},
): string {
  const major = toAmount(minor) / 100
  const hasFraction = major % 1 !== 0
  const value = major.toLocaleString("en-NG", {
    minimumFractionDigits: showDecimals || hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `${currencySymbol(currency)}${value}`
}

/**
 * Money already in major units (naira) — wallet balances and withdrawal
 * amounts, unlike VoteOrder amounts which are minor units (kobo, see
 * formatMoney). Never pass a wallet/withdrawal value through formatMoney.
 */
export function formatNaira(
  amount: number | string | null | undefined,
  currency = "NGN",
): string {
  const value = toAmount(amount)
  return `${currencySymbol(currency)}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Compact counts, e.g. 1234 → "1.2K". */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-NG")
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

/** Time remaining until `target`, clamped at zero. */
export function timeUntil(target: string | Date): Countdown {
  const total = Math.max(0, new Date(target).getTime() - Date.now())
  const seconds = Math.floor(total / 1000)
  return {
    total,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  }
}
