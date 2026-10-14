import type { ComponentPropsWithRef } from "react"
import type { View } from "react-native"
import { LoaderCircle } from "lucide-react-native"
import { AnimatedView, spinKeyframes, useMotion } from "../../lib/motion"
import { useNativeTheme } from "../../lib/theme"

export type SpinnerRootProps = ComponentPropsWithRef<typeof View> & {
  size?: number | "small" | "large"
  color?: string
  animating?: boolean
}
function SpinnerRoot({ size, color, animating = true, style, accessibilityState, ...props }: SpinnerRootProps) {
  const { colors, spinnerSize } = useNativeTheme()
  const { reduced, motion } = useMotion()
  const dimension = size === "small" ? 20 : size === "large" ? 36 : (size ?? spinnerSize)
  return (
    <AnimatedView
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      {...props}
      aria-busy={accessibilityState?.busy ?? true}
      accessibilityState={{ busy: true, ...accessibilityState }}
      style={[
        {
          width: dimension,
          height: dimension,
          flexShrink: 0,
          animationName: reduced || !animating ? "none" : spinKeyframes,
          animationDuration: motion.spinDuration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        },
        style,
      ]}
    >
      <LoaderCircle size={dimension} color={color ?? colors.foreground} aria-hidden />
    </AnimatedView>
  )
}
/** The web loader's SVG path and one-second linear rotation, with reduced-motion support. */
export const Spinner = { Root: SpinnerRoot }
