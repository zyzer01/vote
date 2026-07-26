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

/** Minor units → a display string, e.g. 1_050_000 NGN → "₦10,500". */
export function formatMoney(
  minor: number,
  currency = "NGN",
  { showDecimals }: { showDecimals?: boolean } = {},
): string {
  const major = minor / 100
  const hasFraction = major % 1 !== 0
  const value = major.toLocaleString("en-NG", {
    minimumFractionDigits: showDecimals || hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `${currencySymbol(currency)}${value}`
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
