import { AnimatedView, pulseKeyframes, useMotion } from "../../lib/motion"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { Text, View } from "react-native"
import Svg, { Circle } from "react-native-svg"
import Animated, { Easing, useAnimatedProps, withTiming } from "react-native-reanimated"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"

/** Linear and circular progress with clamped values and an indeterminate state. */
export type ProgressRootProps = ComponentPropsWithRef<typeof View> & {
  value: number | null
  min?: number
  max?: number
}
const [Provider, useProgress] = createRequiredContext<{
  percent: number
  indeterminate: boolean
  state: "loading" | "complete" | "indeterminate"
}>("Progress")
function ProgressRoot({ value, min = 0, max = 100, style, accessibilityValue, ...props }: ProgressRootProps) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min)
    throw new Error("Progress requires finite min < max")
  const now = value !== null && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
  const percent = ((now - min) / (max - min)) * 100
  const { spacing } = useNativeTheme()
  return (
    <Provider
      value={{
        percent,
        indeterminate: value === null,
        state: value === null ? "indeterminate" : now === max ? "complete" : "loading",
      }}
    >
      <View
        accessible
        accessibilityRole="progressbar"
        {...props}
        aria-valuemin={accessibilityValue?.min ?? min}
        aria-valuemax={accessibilityValue?.max ?? max}
        aria-valuenow={value === null ? undefined : (accessibilityValue?.now ?? now)}
        aria-valuetext={accessibilityValue?.text}
        accessibilityValue={{
          min,
          max,
          ...accessibilityValue,
          now: value === null ? undefined : (accessibilityValue?.now ?? now),
        }}
        accessibilityState={{ ...props.accessibilityState, busy: value === null }}
        style={[{ width: "100%", flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, style]}
      />
    </Provider>
  )
}
export type ProgressTrackProps = ComponentPropsWithRef<typeof View>
function ProgressTrack({ style, ...props }: ProgressTrackProps) {
  const { colors, progress, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: "100%",
          height: progress.height,
          overflow: "hidden",
          borderRadius: radius.full,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    />
  )
}
export type ProgressRangeProps = ComponentPropsWithRef<typeof View>
function ProgressRange({ style, ...props }: ProgressRangeProps) {
  const { percent, indeterminate } = useProgress()
  const { colors } = useNativeTheme()
  const { transition, reduced, motion, easing } = useMotion()
  return (
    <AnimatedView
      {...props}
      style={[
        transition(["width"]),
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: indeterminate ? "33.333333%" : `${percent}%`,
          animationName: indeterminate && !reduced ? pulseKeyframes : "none",
          animationDuration: motion.pulseDuration,
          animationTimingFunction: easing,
          animationIterationCount: "infinite",
          height: "100%",
          backgroundColor: colors.primary,
        },
        style,
      ]}
    />
  )
}
export type ProgressLabelProps = ComponentPropsWithRef<typeof Text>
function ProgressLabel({ style, ...props }: ProgressLabelProps) {
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        { ...typography.medium, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.foreground },
        style,
      ]}
    />
  )
}
export type ProgressValueTextProps = ComponentPropsWithRef<typeof Text>
function ProgressValueText({ style, children, ...props }: ProgressValueTextProps) {
  const { percent, indeterminate } = useProgress()
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.regular,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
          color: colors.mutedForeground,
          marginLeft: "auto",
          fontVariant: ["tabular-nums"],
        },
        style,
      ]}
    >
      {children ?? (indeterminate ? "loading..." : `${Math.round(percent)}%`)}
    </Text>
  )
}
const [CircleProvider, useCircle] = createRequiredContext<{ size: number; thickness: number }>("Progress.Circle")
export type ProgressCircleProps = ComponentPropsWithRef<typeof Svg> & {
  /** Circle diameter, in logical pixels. */
  size?: number
  /** Stroke thickness, in logical pixels. */
  thickness?: number
}
function ProgressCircle({ size = 40, thickness = 3, ...props }: ProgressCircleProps) {
  if (!Number.isFinite(size) || !Number.isFinite(thickness) || size <= 0 || thickness <= 0 || thickness > size)
    throw new Error("Progress.Circle requires 0 < thickness <= size")
  return (
    <CircleProvider value={{ size, thickness }}>
      <Svg width={size} height={size} {...props} />
    </CircleProvider>
  )
}
export type ProgressCircleTrackProps = ComponentPropsWithRef<typeof Circle>
function ProgressCircleTrack(props: ProgressCircleTrackProps) {
  const { size, thickness } = useCircle()
  const { colors } = useNativeTheme()
  return (
    <Circle
      cx={size / 2}
      cy={size / 2}
      r={(size - thickness) / 2}
      fill="transparent"
      stroke={colors.muted}
      strokeWidth={thickness}
      {...props}
    />
  )
}
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
export type ProgressCircleRangeProps = ComponentPropsWithRef<typeof Circle>
function ProgressCircleRange(props: ProgressCircleRangeProps) {
  const { size, thickness } = useCircle()
  const { percent, indeterminate } = useProgress()
  const { colors } = useNativeTheme()
  const { reduced, motion } = useMotion()
  // Match the circumference constant used by Ark's circle geometry.
  const circumference = 2 * 3.14159 * ((size - thickness) / 2)
  const animatedProps = useAnimatedProps(
    () => ({
      strokeDashoffset: withTiming(circumference * (1 - percent / 100), {
        duration: reduced ? 0 : motion.duration,
        easing: Easing.bezier(...motion.easing),
      }),
      opacity: withTiming(!indeterminate && percent === 0 ? 0 : 1, {
        duration: reduced ? 0 : motion.duration,
        easing: Easing.bezier(...motion.easing),
      }),
    }),
    [circumference, percent, reduced, motion.duration, motion.easing, indeterminate]
  )
  return (
    <AnimatedCircle
      cx={size / 2}
      cy={size / 2}
      r={(size - thickness) / 2}
      fill="transparent"
      stroke={colors.primary}
      strokeWidth={thickness}
      strokeDasharray={indeterminate ? undefined : circumference}
      transform={`rotate(-90 ${size / 2} ${size / 2})`}
      animatedProps={animatedProps}
      {...props}
    />
  )
}
export type ProgressViewProps = ComponentPropsWithRef<typeof View> & {
  /** State in which to render this content. */
  state: "loading" | "complete" | "indeterminate"
}
function ProgressView({ state, ...props }: ProgressViewProps) {
  return useProgress().state === state ? <View {...props} /> : null
}
export type ProgressContextProps = {
  /** Receives normalized progress and its state. */ children: (state: ReturnType<typeof useProgress>) => ReactNode
}
function ProgressContext({ children }: ProgressContextProps) {
  return children(useProgress())
}
export const Progress = {
  Root: ProgressRoot,
  Context: ProgressContext,
  View: ProgressView,
  Circle: ProgressCircle,
  CircleTrack: ProgressCircleTrack,
  CircleRange: ProgressCircleRange,
  Track: ProgressTrack,
  Range: ProgressRange,
  Label: ProgressLabel,
  ValueText: ProgressValueText,
}
