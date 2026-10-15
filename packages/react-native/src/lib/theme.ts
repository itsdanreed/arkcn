import { createContext, createElement, useContext, type ReactNode } from "react"
import { Platform, processColor, useColorScheme } from "react-native"
import { cssColor, designTokens, nativeColor, palettes } from "./tokens"

export const nativeTokens = designTokens
const convertPalette = (scheme: "light" | "dark", web = false) => {
  // RN Web quantizes rgba alpha to two decimals. CSS variable fallbacks preserve
  // the source OKLCH colors and fractional opacity in browser previews.
  const color = (value: Parameters<typeof nativeColor>[0]) =>
    web ? `var(--arkcn-native-color, ${cssColor(value)})` : nativeColor(value)
  const p = palettes[scheme]
  return {
    background: color(p.background),
    foreground: color(p.foreground),
    card: color(p.card),
    popover: color(p.popover),
    popoverForeground: color(p["popover-foreground"]),
    cardForeground: color(p["card-foreground"]),
    primary: color(p.primary),
    primaryForeground: color(p["primary-foreground"]),
    secondary: color(p.secondary),
    secondaryHover: color([p.secondary[0] * 0.95 + p.foreground[0] * 0.05, 0, 0]),
    secondaryForeground: color(p["secondary-foreground"]),
    muted: color(p.muted),
    mutedForeground: color(p["muted-foreground"]),
    accent: color(p.accent),
    accentForeground: color(p["accent-foreground"]),
    destructive: color(p.destructive),
    border: color(p.border),
    input: color(p.input),
    ring: color(p.ring),
    sidebar: color(p["sidebar"]),
    sidebarForeground: color(p["sidebar-foreground"]),
    sidebarPrimary: color(p["sidebar-primary"]),
    sidebarPrimaryForeground: color(p["sidebar-primary-foreground"]),
    sidebarAccent: color(p["sidebar-accent"]),
    sidebarBorder: color(p["sidebar-border"]),
  }
}
export type NativeColors = ReturnType<typeof convertPalette>
export const nativeColors = { light: convertPalette("light"), dark: convertPalette("dark") }
const browserColors = { light: convertPalette("light", true), dark: convertPalette("dark", true) }

/** Multiply alpha just as Tailwind's color/opacity utilities do. */
export function withOpacity(color: string, opacity: number) {
  if (Platform.OS === "web")
    return `var(--arkcn-native-color, color-mix(in oklab, ${color} ${opacity * 100}%, transparent))`
  const rgba = color.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\s*\)$/)
  if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${Number(rgba[4] ?? 1) * opacity})`
  const value = processColor(color)
  if (typeof value !== "number") return color
  return `rgba(${(value >>> 16) & 255}, ${(value >>> 8) & 255}, ${value & 255}, ${((value >>> 24) / 255) * opacity})`
}

export type NativeThemeProviderProps = {
  children: ReactNode
  colorScheme?: "light" | "dark"
  colors?: Partial<NativeColors>
  /** Override the system motion preference, for example in a preview or accessibility setting. */
  reducedMotion?: boolean
  /** Register matching Geist font files in your app for identical typography on devices. */
  fonts?: { regular: string; medium: string }
}
const ThemeContext = createContext<Omit<NativeThemeProviderProps, "children">>({})
export function NativeThemeProvider({ children, ...theme }: NativeThemeProviderProps) {
  return createElement(ThemeContext.Provider, { value: theme }, children)
}
export function useNativeTheme() {
  const deviceScheme = useColorScheme()
  const theme = useContext(ThemeContext)
  const colorScheme = theme.colorScheme ?? (deviceScheme === "dark" ? "dark" : "light")
  const webFont = Platform.OS === "web" ? "Geist Variable" : undefined
  return {
    ...nativeTokens,
    colorScheme,
    reducedMotion: theme.reducedMotion,
    colors: { ...(Platform.OS === "web" ? browserColors : nativeColors)[colorScheme], ...theme.colors },
    typography: {
      regular: { includeFontPadding: false, fontFamily: theme.fonts?.regular ?? webFont, fontWeight: "400" as const },
      medium: {
        includeFontPadding: false,
        fontFamily: theme.fonts?.medium ?? webFont,
        fontWeight: (theme.fonts?.medium ? "400" : "500") as "400" | "500",
      },
    },
  }
}
