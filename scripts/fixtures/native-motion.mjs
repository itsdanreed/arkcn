import { Pressable } from "./native-host.mjs"
export default {
  View: "View",
  Text: "Text",
  createAnimatedComponent: (component) => (component === Pressable ? Pressable : component),
}
export const useReducedMotion = () => false
export const cubicBezier = (...points) => `cubic-bezier(${points.join(", ")})`
export const useAnimatedStyle = (updater) => updater()
export const timingCalls = []
export const withTiming = (value, config) => {
  timingCalls.push({ value, config })
  return value
}
export const Easing = { bezier: cubicBezier }
export const useAnimatedProps = (updater) => updater()
