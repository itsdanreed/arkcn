import { Platform, processColor } from "react-native"
import { nativeColor } from "./tokens"

/** Web's relative OKLCH tint, preserving the primary hue for custom native palettes. */
export function bubbleTint(primary: string, dark: boolean, active: boolean) {
  const lightness = dark ? (active ? 0.35 : 0.3) : active ? 0.88 : 0.93
  const factor = active ? 0.5 : 0.4
  if (Platform.OS === "web")
    return `var(--arkcn-native-color, oklch(from ${primary} ${lightness} calc(c * ${factor}) h))`
  const value = processColor(primary)
  if (typeof value !== "number") return nativeColor([lightness, 0, 0])
  const linear = (n: number) => {
    const s = n / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = linear((value >>> 16) & 255),
    g = linear((value >>> 8) & 255),
    b = linear(value & 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const axisB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return nativeColor([lightness, Math.hypot(a, axisB) * factor, (Math.atan2(axisB, a) * 180) / Math.PI])
}
