import { useState, useRef } from "react"
import { Pressable, ScrollView } from "./native-host.mjs"
export default {
  View: "View",
  ScrollView,
  Text: "Text",
  createAnimatedComponent: (component) => (component === Pressable ? Pressable : component),
}
export const useReducedMotion = () => false
export const cubicBezier = (...points) => `cubic-bezier(${points.join(", ")})`
const styleUpdaters = new WeakMap()
export const useAnimatedStyle = (updater) => {
  const style = updater()
  styleUpdaters.set(style, updater)
  return style
}
export const readAnimatedStyle = (style) =>
  Object.assign(
    {},
    ...[style]
      .flat(Infinity)
      .filter(Boolean)
      .map((part) => (styleUpdaters.has(part) ? styleUpdaters.get(part)() : part))
  )
export const timingCalls = []
export const withTiming = (value, config) => {
  timingCalls.push({ value, config })
  return value
}
export const Easing = { bezier: cubicBezier }
export const useAnimatedProps = (updater) => updater()

export const useSharedValue = (initial) =>
  useState(() => {
    let value = initial
    return {
      get: () => value,
      set: (next) => {
        value = typeof next === "function" ? next(value) : next
      },
    }
  })[0]
export const useAnimatedRef = () => useRef(null)
export const useScrollOffset = () => useSharedValue(0)
export const useDerivedValue = (updater) => ({ get: updater })

export const useAnimatedScrollHandler = (handler) => (event) => handler(event.nativeEvent)
export const useAnimatedReaction = () => {}
