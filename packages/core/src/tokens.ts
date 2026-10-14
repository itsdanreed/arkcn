/** Canonical design values shared by the web stylesheet and the native renderer.
 * Colors remain in OKLCH for CSS; native receives their sRGB equivalents.
 */
export type OklchColor = readonly [lightness: number, chroma: number, hue: number, alpha?: number]
export const palettes = {
  light: {
    background: [1.0, 0.0, 0.0],
    foreground: [0.145, 0.0, 0.0],
    card: [1.0, 0.0, 0.0],
    "card-foreground": [0.145, 0.0, 0.0],
    popover: [1.0, 0.0, 0.0],
    "popover-foreground": [0.145, 0.0, 0.0],
    primary: [0.205, 0.0, 0.0],
    "primary-foreground": [0.985, 0.0, 0.0],
    secondary: [0.97, 0.0, 0.0],
    "secondary-foreground": [0.205, 0.0, 0.0],
    muted: [0.97, 0.0, 0.0],
    "muted-foreground": [0.556, 0.0, 0.0],
    accent: [0.97, 0.0, 0.0],
    "accent-foreground": [0.205, 0.0, 0.0],
    destructive: [0.577, 0.245, 27.325],
    border: [0.922, 0.0, 0.0],
    input: [0.922, 0.0, 0.0],
    ring: [0.708, 0.0, 0.0],
    "chart-1": [0.87, 0.0, 0.0],
    "chart-2": [0.556, 0.0, 0.0],
    "chart-3": [0.439, 0.0, 0.0],
    "chart-4": [0.371, 0.0, 0.0],
    "chart-5": [0.269, 0.0, 0.0],
    sidebar: [0.985, 0.0, 0.0],
    "sidebar-foreground": [0.145, 0.0, 0.0],
    "sidebar-primary": [0.205, 0.0, 0.0],
    "sidebar-primary-foreground": [0.985, 0.0, 0.0],
    "sidebar-accent": [0.97, 0.0, 0.0],
    "sidebar-accent-foreground": [0.205, 0.0, 0.0],
    "sidebar-border": [0.922, 0.0, 0.0],
    "sidebar-ring": [0.708, 0.0, 0.0],
  },
  dark: {
    background: [0.145, 0.0, 0.0],
    foreground: [0.985, 0.0, 0.0],
    card: [0.205, 0.0, 0.0],
    "card-foreground": [0.985, 0.0, 0.0],
    popover: [0.205, 0.0, 0.0],
    "popover-foreground": [0.985, 0.0, 0.0],
    primary: [0.922, 0.0, 0.0],
    "primary-foreground": [0.205, 0.0, 0.0],
    secondary: [0.269, 0.0, 0.0],
    "secondary-foreground": [0.985, 0.0, 0.0],
    muted: [0.269, 0.0, 0.0],
    "muted-foreground": [0.708, 0.0, 0.0],
    accent: [0.269, 0.0, 0.0],
    "accent-foreground": [0.985, 0.0, 0.0],
    destructive: [0.704, 0.191, 22.216],
    border: [1.0, 0.0, 0.0, 0.1],
    input: [1.0, 0.0, 0.0, 0.15],
    ring: [0.556, 0.0, 0.0],
    "chart-1": [0.87, 0.0, 0.0],
    "chart-2": [0.556, 0.0, 0.0],
    "chart-3": [0.439, 0.0, 0.0],
    "chart-4": [0.371, 0.0, 0.0],
    "chart-5": [0.269, 0.0, 0.0],
    sidebar: [0.205, 0.0, 0.0],
    "sidebar-foreground": [0.985, 0.0, 0.0],
    "sidebar-primary": [0.488, 0.243, 264.376],
    "sidebar-primary-foreground": [0.985, 0.0, 0.0],
    "sidebar-accent": [0.269, 0.0, 0.0],
    "sidebar-accent-foreground": [0.985, 0.0, 0.0],
    "sidebar-border": [1.0, 0.0, 0.0, 0.1],
    "sidebar-ring": [0.556, 0.0, 0.0],
  },
} as const satisfies Record<"light" | "dark", Record<string, OklchColor>>

export const designTokens = {
  spacing: { unit: 4, half: 2, xs: 4, buttonGap: 6, sm: 8, controlX: 10, md: 12, lg: 16, xl: 24 },
  radius: { sm: 6, md: 8, lg: 10, xl: 14, full: 9999 },
  fontSize: { sm: 12, compact: 12.8, md: 14, body: 16, title: 16 },
  lineHeight: { sm: 16, md: 20, body: 24, title: 22 },
  controlHeight: { xs: 24, sm: 28, default: 32, lg: 36 },
  buttonSizes: {
    default: { height: 32, paddingX: 10, gap: 6, radius: 10, fontSize: 14, lineHeight: 20 },
    xs: { height: 24, paddingX: 8, gap: 4, radius: 8, fontSize: 12, lineHeight: 16 },
    sm: { height: 28, paddingX: 10, gap: 4, radius: 8, fontSize: 12.8, lineHeight: 19.2 },
    lg: { height: 36, paddingX: 10, gap: 6, radius: 10, fontSize: 14, lineHeight: 20 },
  },
  card: { spacing: 16, compactSpacing: 12, radius: 14 },
  badge: { height: 20, paddingX: 8, paddingY: 2, radius: 26 },
  textareaHeight: 64,
  spinnerSize: 16,
  minimumTouchTarget: 44,
  selection: { size: 16, checkboxRadius: 4, dotSize: 8, markSize: 8, checkWidth: 5 },
  switches: {
    default: { width: 32, height: 18.4, thumb: 16 },
    sm: { width: 24, height: 14, thumb: 12 },
  },
  tabs: { padding: 3, triggerHeight: 25, lineWidth: 2 },
  progress: { height: 4 },
  avatar: { sm: 24, default: 32, lg: 40 },
  opacity: { disabled: 0.5, pressed: 0.8 },
  motion: {
    duration: 150,
    easing: [0.4, 0, 0.2, 1],
    pulseDuration: 2000,
    pulseEasing: [0.4, 0, 0.6, 1],
    spinDuration: 1000,
  },
} as const

export function cssColor([l, c, h, alpha]: OklchColor) {
  return `oklch(${l} ${c} ${h}${alpha === undefined ? "" : ` / ${alpha * 100}%`})`
}

/** OKLCH -> linear sRGB -> gamma-encoded sRGB, clipped to the native display gamut. */
export function nativeColor([l, c, h, alpha = 1]: OklchColor) {
  const radians = (h * Math.PI) / 180
  const a = c * Math.cos(radians)
  const b = c * Math.sin(radians)
  const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const ss = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const channel = (value: number) =>
    Math.round(255 * Math.max(0, Math.min(1, value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)))
  return `rgba(${channel(4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss)}, ${channel(-1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss)}, ${channel(-0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss)}, ${alpha})`
}
