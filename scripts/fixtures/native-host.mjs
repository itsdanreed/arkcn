// Host-only test doubles. These tests verify our state and prop contracts, not platform rendering.
import { createElement, useSyncExternalStore } from "react"
export const Modal = "Modal"
export const KeyboardAvoidingView = "KeyboardAvoidingView"
export const ScrollView = "ScrollView"
export const View = "View"
export const Text = "Text"
export const TextInput = "TextInput"
export const ActivityIndicator = "ActivityIndicator"
export const Image = "Image"
export const StyleSheet = {
  hairlineWidth: 1,
  flatten: (style) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean)),
}
let colorScheme = "light"
const schemeListeners = new Set()
const subscribeScheme = (listener) => {
  schemeListeners.add(listener)
  return () => schemeListeners.delete(listener)
}
export const useColorScheme = () => useSyncExternalStore(subscribeScheme, () => colorScheme)
export const emitColorScheme = (value) => {
  colorScheme = value
  schemeListeners.forEach((listener) => listener())
}
export function Pressable({ children, ...props }) {
  return createElement("Pressable", props, typeof children === "function" ? children({ pressed: false }) : children)
}

export const Platform = { OS: "ios" }
export const I18nManager = { isRTL: false }
export function processColor(color) {
  const match = color.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/)
  if (!match) return null
  const [, r, g, b, a] = match.map(Number)
  return ((Math.round(a * 255) << 24) | (r << 16) | (g << 8) | b) >>> 0
}

export const useWindowDimensions = () => ({ width: 1024, height: 768, fontScale: 1, scale: 1 })
const motionListeners = new Set()
export const AccessibilityInfo = {
  sendAccessibilityEvent: () => {},
  addEventListener: (_, listener) => {
    motionListeners.add(listener)
    return { remove: () => motionListeners.delete(listener) }
  },
}
export const emitReducedMotion = (value) => motionListeners.forEach((listener) => listener(value))

const appStateListeners = new Set()
export const AppState = {
  addEventListener: (_, listener) => {
    appStateListeners.add(listener)
    return { remove: () => appStateListeners.delete(listener) }
  },
}
export const emitAppState = (state) => appStateListeners.forEach((listener) => listener(state))
