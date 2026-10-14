import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, AnimatedText, AnimatedView, useMotion, useShadowTransition } from "../../lib/motion"
import { Children, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { Pressable, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { Spinner } from "./spinner"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type ButtonProps = ComponentPropsWithRef<typeof Pressable> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  /** Displays the validation border and ring. */
  invalid?: boolean
  loading?: boolean
  textStyle?: StyleProp<TextStyle>
  backgroundClip?: "padding-box" | "border-box"
}

/** Matches web button variants and visible dimensions, with an expanded native touch area. */
export function Button({
  variant = "default",
  size = "default",
  loading = false,
  invalid = false,
  disabled,
  children,
  style,
  textStyle,
  backgroundClip = "padding-box",
  accessibilityState,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const { colors, colorScheme, buttonSizes, controlHeight, minimumTouchTarget, opacity, typography } = useNativeTheme()
  const { transition } = useMotion()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const state = { pressed }
  const resolvedStyle = StyleSheet.flatten(typeof style === "function" ? style(state) : style)
  const animatedShadow = useShadowTransition(
    resolvedStyle?.boxShadow ?? [
      {
        offsetX: 0,
        offsetY: 0,
        spreadDistance: invalid || focused ? 3 : 0,
        color: withOpacity(
          invalid || variant === "destructive" ? colors.destructive : colors.ring,
          invalid || focused ? (invalid || variant === "destructive" ? (colorScheme === "dark" ? 0.4 : 0.2) : 0.5) : 0
        ),
      },
    ]
  )
  const borderWidth = resolvedStyle?.borderWidth ?? 1
  const icon = size.startsWith("icon")
  const scale = (size === "icon" ? "default" : size.replace("icon-", "")) as keyof typeof buttonSizes
  const metrics = buttonSizes[scale]
  const borderRadius = resolvedStyle?.borderRadius ?? metrics.radius
  const innerRadius = (value: ViewStyle["borderRadius"]) =>
    typeof value === "number" ? Math.max(0, value - (backgroundClip === "padding-box" ? borderWidth : 0)) : value
  const backgroundCorners: ViewStyle = {
    borderTopLeftRadius: innerRadius(resolvedStyle?.borderTopLeftRadius ?? borderRadius),
    borderTopRightRadius: innerRadius(resolvedStyle?.borderTopRightRadius ?? borderRadius),
    borderBottomLeftRadius: innerRadius(resolvedStyle?.borderBottomLeftRadius ?? borderRadius),
    borderBottomRightRadius: innerRadius(resolvedStyle?.borderBottomRightRadius ?? borderRadius),
  }
  const height = controlHeight[scale]
  const color =
    variant === "destructive"
      ? colors.destructive
      : variant === "default"
        ? colors.primaryForeground
        : variant === "secondary"
          ? colors.secondaryForeground
          : variant === "link"
            ? colors.primary
            : colors.foreground
  const expanded = props["aria-expanded"] ?? accessibilityState?.expanded
  const background = (pressed: boolean) => {
    if (expanded && !pressed && (variant === "outline" || variant === "ghost")) return colors.muted
    if (variant === "default") return pressed ? withOpacity(colors.primary, opacity.pressed) : colors.primary
    if (variant === "secondary") return pressed ? colors.secondaryHover : colors.secondary
    if (variant === "destructive")
      return withOpacity(colors.destructive, (colorScheme === "dark" ? 0.2 : 0.1) + (pressed ? 0.1 : 0))
    if (variant === "outline")
      return colorScheme === "dark"
        ? withOpacity(colors.input, pressed ? 0.5 : 0.3)
        : pressed
          ? colors.muted
          : colors.background
    if (variant === "ghost" && pressed) return colorScheme === "dark" ? withOpacity(colors.muted, 0.5) : colors.muted
    return "transparent"
  }
  return (
    <AnimatedPressable
      accessibilityRole="button"
      hitSlop={Math.max(0, (minimumTouchTarget - height) / 2)}
      {...props}
      disabled={disabled || loading}
      aria-disabled={!!(disabled || loading)}
      aria-busy={loading || accessibilityState?.busy}
      aria-expanded={expanded}
      accessibilityState={{
        ...accessibilityState,
        disabled: !!(disabled || loading),
        busy: loading || accessibilityState?.busy,
      }}
      onPressIn={(event) => {
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        onPressOut?.(event)
      }}
      onHoverIn={(event) => {
        setHovered(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        onHoverOut?.(event)
      }}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        transition("all"),
        {
          minHeight: height,
          ...(icon ? { minWidth: height, width: height } : {}),
          paddingHorizontal: icon ? 0 : metrics.paddingX,
          paddingVertical: 0,
          borderRadius: metrics.radius,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: metrics.gap,
          backgroundColor: "transparent",
          zIndex: focused ? 10 : 0,
          borderWidth: 1,
          borderColor: invalid
            ? colorScheme === "dark"
              ? withOpacity(colors.destructive, 0.5)
              : colors.destructive
            : focused
              ? variant === "destructive"
                ? withOpacity(colors.destructive, 0.4)
                : colors.ring
              : variant === "outline"
                ? colorScheme === "dark"
                  ? colors.input
                  : colors.border
                : "transparent",
          opacity: disabled || loading ? opacity.disabled : 1,
          transform: [{ translateY: state.pressed ? 1 : 0 }],
        },
        resolvedStyle,
        animatedShadow,
        { backgroundColor: "transparent" },
      ]}
    >
      {(state) => {
        const content = typeof children === "function" ? children(state) : children
        const textOnly = Children.toArray(content).every(
          (child) => typeof child === "string" || typeof child === "number"
        )
        const label = (text: ReactNode, key?: number) => (
          <AnimatedText
            key={key}
            style={[
              transition("all"),
              {
                ...typography.medium,
                color,
                fontSize: metrics.fontSize,
                lineHeight: metrics.lineHeight,
                textDecorationLine: variant === "link" && (hovered || state.pressed) ? "underline" : "none",
              },
              textStyle,
            ]}
          >
            {text}
          </AnimatedText>
        )
        return (
          <>
            <AnimatedView
              pointerEvents="none"
              accessible={false}
              style={[
                transition(["backgroundColor"]),
                {
                  position: "absolute",
                  zIndex: -1,
                  inset: backgroundClip === "border-box" ? -borderWidth : 0,
                  borderRadius:
                    typeof borderRadius === "number"
                      ? borderRadius - (backgroundClip === "padding-box" ? borderWidth : 0)
                      : borderRadius,
                  ...backgroundCorners,
                  backgroundColor: resolvedStyle?.backgroundColor ?? background(hovered || pressed),
                },
              ]}
            />
            {loading && <Spinner.Root color={color} accessible={false} />}
            {textOnly
              ? label(content)
              : Children.map(content, (child, index) =>
                  typeof child === "string" || typeof child === "number" ? label(child, index) : child
                )}
          </>
        )
      }}
    </AnimatedPressable>
  )
}
