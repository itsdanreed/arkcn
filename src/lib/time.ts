const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
]

/** "3 minutes ago", "yesterday", "in 2 weeks"; "just now" under a minute. */
export function formatRelativeTime(date: Date, options: { now?: Date; locale?: string } = {}) {
  const now = options.now ?? new Date()
  const diff = date.getTime() - now.getTime()
  if (Math.abs(diff) < 60_000) return "just now"
  const rtf = new Intl.RelativeTimeFormat(options.locale, { numeric: "auto" })
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit)
  }
  return "just now"
}

/** Compact past-only form for dense lists: "now", "5m", "3h", "2d", "4w", "3mo", "1y". */
export function formatCompactAge(date: Date, now = new Date()) {
  const s = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000))
  if (s < 60) return "now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  const w = Math.round(d / 7)
  if (w < 5) return `${w}w`
  const mo = Math.round(d / 30)
  if (mo < 12) return `${mo}mo`
  return `${Math.round(d / 365)}y`
}
