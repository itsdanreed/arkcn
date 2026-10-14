import { useEffect, useState } from "react"
import { AccessibilityInfo, Platform, Pressable, TextInput, type ViewStyle } from "react-native"
import Animated, {
  cubicBezier,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  type CSSAnimationKeyframes,
  type CSSTransitionProperties,
} from "react-native-reanimated"
import { useNativeTheme } from "./theme"

export const AnimatedView = Animated.View
export const AnimatedText = Animated.Text
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
export const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

/** Expo SDKs before CSS boxShadow support still animate shadows on the UI thread. */
export function useShadowTransition(shadow: ViewStyle["boxShadow"]) {
  const { reduced, motion } = useMotion()
  // Keep all four lengths explicit: the web animation serializer omits absent fields.
  const length = (value: number | string | undefined) => (typeof value === "number" ? `${value}px` : (value ?? "0px"))
  const webShadow =
    typeof shadow === "string"
      ? shadow
      : shadow
          ?.map(
            (layer) =>
              `${layer.inset ? "inset " : ""}${length(layer.offsetX)} ${length(layer.offsetY)} ${length(layer.blurRadius)} ${length(layer.spreadDistance)} ${String(layer.color ?? "black")}`
          )
          .join(", ") || "none"
  const animated = useAnimatedStyle(() => {
    if (Platform.OS === "web") return {}
    if (typeof shadow === "string") return { boxShadow: shadow }
    const timing = { duration: reduced ? 0 : motion.duration, easing: Easing.bezier(...motion.easing) }
    const layers = [...(shadow ?? [])]
    // Keep empty layers while fading to/from no shadow, including the two-layer tab shadow.
    while (layers.length < 2) layers.push({ offsetX: 0, offsetY: 0, color: "transparent" })
    return {
      boxShadow: layers.map((layer) => ({
        offsetX: withTiming(layer.offsetX ?? 0, timing),
        offsetY: withTiming(layer.offsetY ?? 0, timing),
        blurRadius: withTiming(layer.blurRadius ?? 0, timing),
        spreadDistance: withTiming(layer.spreadDistance ?? 0, timing),
        color: withTiming(String(layer.color ?? "black"), timing),
        inset: layer.inset,
      })),
    }
  }, [shadow, webShadow, reduced, motion.duration, motion.easing])
  return Platform.OS === "web" ? { boxShadow: webShadow } : animated
}

/** Shared web/native timing, including changes to the system's reduced-motion preference. */
export function useMotion() {
  const initial = useReducedMotion()
  const [systemReduced, setSystemReduced] = useState(initial)
  const { motion, reducedMotion } = useNativeTheme()
  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setSystemReduced)
    return () => listener.remove()
  }, [])
  const reduced = reducedMotion ?? systemReduced
  const easing = cubicBezier(...motion.easing)
  const transition = (transitionProperty: CSSTransitionProperties["transitionProperty"]): CSSTransitionProperties => ({
    transitionProperty,
    transitionDuration: reduced ? 0 : motion.duration,
    transitionTimingFunction: easing,
  })
  return { reduced, motion, easing, transition }
}
export const spinKeyframes: CSSAnimationKeyframes = {
  from: { transform: [{ rotate: "0deg" }] },
  to: { transform: [{ rotate: "360deg" }] },
}
export const pulseKeyframes: CSSAnimationKeyframes = { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } }
