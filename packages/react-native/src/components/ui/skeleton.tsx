import type { ComponentPropsWithRef } from "react"
import type { View } from "react-native"
import { cubicBezier } from "react-native-reanimated"
import { AnimatedView, pulseKeyframes, useMotion } from "../../lib/motion"
import { useNativeTheme } from "../../lib/theme"

export type SkeletonRootProps = ComponentPropsWithRef<typeof View>
function SkeletonRoot({ style, ...props }: SkeletonRootProps) {
  const { colors, radius } = useNativeTheme()
  const { reduced, motion } = useMotion()
  return (
    <AnimatedView
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...props}
      style={[
        {
          backgroundColor: colors.muted,
          borderRadius: radius.md,
          animationName: reduced ? "none" : pulseKeyframes,
          animationDuration: motion.pulseDuration,
          animationTimingFunction: cubicBezier(...motion.pulseEasing),
          animationIterationCount: "infinite",
        },
        style,
      ]}
    />
  )
}
/** Loading placeholder using the web two-second opacity pulse; reduced motion disables the pulse. */
export const Skeleton = { Root: SkeletonRoot }
