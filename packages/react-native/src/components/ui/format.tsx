import "@formatjs/intl-pluralrules/polyfill.js"
import "@formatjs/intl-pluralrules/locale-data/en.js"
import "@formatjs/intl-relativetimeformat/polyfill.js"
import "@formatjs/intl-relativetimeformat/locale-data/en.js"
import { createContext, useContext, type ReactNode } from "react"
import {
  formatBytes,
  formatNumber,
  formatTime,
  type FormatBytesOptions,
  type FormatTimeOptions,
} from "@zag-js/i18n-utils"

const LocaleContext = createContext<string | undefined>(undefined)
export type FormatLocaleProviderProps = { locale: string; children: ReactNode }
function FormatLocaleProvider({ locale, children }: FormatLocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
function useFormatLocale(locale?: string) {
  const provided = useContext(LocaleContext)
  return locale ?? provided ?? Intl.NumberFormat().resolvedOptions().locale
}
/** Formatting helpers return text. Place them inside native Text, just like ordinary string content. */
export type FormatNumberProps = Intl.NumberFormatOptions & { value: number; locale?: string }
function FormatNumber({ value, locale, ...options }: FormatNumberProps) {
  return <>{formatNumber(value, useFormatLocale(locale), options)}</>
}
export type FormatByteProps = FormatBytesOptions & { value: number; locale?: string }
function FormatByte({ value, locale, ...options }: FormatByteProps) {
  const resolvedLocale = useFormatLocale(locale)
  const formatted = formatBytes(value, resolvedLocale, options)
  // iOS ICU omits the English short-unit separator that browser ICU includes.
  // Narrow units intentionally omit spaces; other locales retain their own rules.
  const shortEnglish =
    resolvedLocale.split("-")[0].toLowerCase() === "en" && (options.unitDisplay ?? "short") === "short"
  return <>{shortEnglish ? formatted.replace(/([0-9∞])(?=[A-Za-z])/u, "$1 ") : formatted}</>
}
export type FormatTimeProps = FormatTimeOptions & { value: string | Date; locale?: string }
function FormatTime({ value, locale, ...options }: FormatTimeProps) {
  return <>{formatTime(value, useFormatLocale(locale), options)}</>
}
export type FormatRelativeTimeProps = Intl.RelativeTimeFormatOptions & { value: Date; locale?: string }
function FormatRelativeTime({ value, locale, ...options }: FormatRelativeTimeProps) {
  const formatter = new Intl.RelativeTimeFormat(useFormatLocale(locale), options)
  const difference = value.getTime() - Date.now()
  // Match Zag's fixed-duration, largest-unit rounding. Read Intl at render time:
  // another library may have imported Zag before the Hermes polyfill was installed.
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 86400000],
    ["month", 30 * 86400000],
    ["week", 7 * 86400000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
  ]
  const [unit, duration] = units.find(([, duration]) => Math.abs(difference) >= duration) ?? units[6]
  return <>{formatter.format(Math.floor(Math.abs(difference) / duration) * Math.sign(difference), unit)}</>
}
export const Format = {
  Number: FormatNumber,
  Byte: FormatByte,
  Time: FormatTime,
  RelativeTime: FormatRelativeTime,
  LocaleProvider: FormatLocaleProvider,
}
