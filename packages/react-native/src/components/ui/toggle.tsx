/** A persistent pressed button, with web-matched sizes, colors, and 150ms transitions. */
import { Children, cloneElement, isValidElement, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, AnimatedText, useMotion, useShadowTransition } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type UseToggleProps = {
  /** Controlled pressed state. */
  pressed?: boolean
  /** Initial uncontrolled pressed state. */
  defaultPressed?: boolean
  /** Receives the next pressed state, matching Ark's Toggle callback. */
  onPressedChange?: (pressed: boolean) => void
  /** Prevents interaction. */
  disabled?: boolean
}
export function useToggle({ pressed, defaultPressed = false, onPressedChange, disabled = false }: UseToggleProps = {}) {
  const [value, setPressed] = useControllable(pressed, defaultPressed, onPressedChange)
  return { pressed: value, setPressed, disabled }
}
export type UseToggleReturn = ReturnType<typeof useToggle>
const [Provider, useToggleContext] = createRequiredContext<UseToggleReturn & { size?: "sm" | "default" | "lg" }>(
  "Toggle"
)
export { useToggleContext }
export type ToggleRootProps = Omit<ComponentPropsWithRef<typeof Pressable>, "children"> &
  UseToggleProps & {
    /** Surface treatment. */
    variant?: "default" | "outline"
    /** Visible control dimensions. */
    size?: "sm" | "default" | "lg"
    /** Content of the toggle. */
    children?: ReactNode
    /** Overrides the built-in text label style. */
    textStyle?: StyleProp<TextStyle>
  }
function ToggleRoot({
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  variant = "default",
  size = "default",
  children,
  style,
  textStyle,
  onPress,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  accessibilityState,
  ...props
}: ToggleRootProps) {
  const state = useToggle({ pressed, defaultPressed, onPressedChange, disabled })
  const { colors, typography, minimumTouchTarget } = useNativeTheme()
  const { transition } = useMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touching, setTouching] = useState(false)
  const content = Children.toArray(children).reduce<ReactNode[]>((items, child) => {
    const last = items[items.length - 1]
    if (
      (typeof child === "string" || typeof child === "number") &&
      (typeof last === "string" || typeof last === "number")
    )
      items[items.length - 1] = String(last) + String(child)
    else items.push(child)
    return items
  }, [])
  const height = size === "sm" ? 28 : size === "lg" ? 36 : 32
  const resolvedStyle = StyleSheet.flatten(typeof style === "function" ? style({ pressed: touching }) : style)
  const shadow = useShadowTransition(
    resolvedStyle?.boxShadow ?? [
      { offsetX: 0, offsetY: 0, spreadDistance: focused ? 3 : 0, color: withOpacity(colors.ring, focused ? 0.5 : 0) },
    ]
  )
  return (
    <Provider value={{ ...state, size }}>
      <AnimatedPressable
        accessibilityRole="button"
        hitSlop={Math.max(0, (minimumTouchTarget - height) / 2)}
        {...props}
        {...{ "aria-pressed": props.accessibilityRole === "radio" ? undefined : state.pressed }}
        aria-checked={props.accessibilityRole === "radio" ? state.pressed : undefined}
        disabled={disabled}
        aria-disabled={!!disabled}
        accessibilityState={{
          ...accessibilityState,
          ...(props.accessibilityRole === "radio" ? { checked: state.pressed } : { selected: state.pressed }),
          disabled: !!disabled,
        }}
        onPressIn={(event) => {
          setTouching(true)
          props.onPressIn?.(event)
        }}
        onPressOut={(event) => {
          setTouching(false)
          props.onPressOut?.(event)
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
        onPress={(event) => {
          if (disabled) return
          onPress?.(event)
          if (!event.defaultPrevented) state.setPressed(!state.pressed)
        }}
        style={[
          transition("all"),
          {
            height,
            minWidth: height,
            flexShrink: 0,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            borderRadius: size === "sm" ? 8 : 10,
            borderWidth: variant === "outline" ? 1 : 0,
            borderColor: focused ? colors.ring : colors.input,
            backgroundColor: state.pressed || hovered ? colors.muted : "transparent",
            opacity: disabled ? 0.5 : 1,
            zIndex: focused ? 10 : 0,
          },
          resolvedStyle,
          shadow,
        ]}
      >
        {Children.map(content, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <AnimatedText
              style={[
                transition("all"),
                { ...typography.medium, fontSize: size === "sm" ? 12.8 : 14, lineHeight: 20, color: colors.foreground },
                textStyle,
              ]}
            >
              {typeof child === "string" ? child.trim() : child}
            </AnimatedText>
          ) : isValidElement<{ size?: number; color?: string }>(child) ? (
            cloneElement(child, {
              size: child.props.size ?? (size === "sm" ? 14 : 16),
              color: child.props.color ?? colors.foreground,
            })
          ) : (
            child
          )
        )}
      </AnimatedPressable>
    </Provider>
  )
}
export type ToggleIndicatorProps = ComponentPropsWithRef<typeof View> & {
  /** Content shown when the toggle is off. */
  fallback?: ReactNode
}
function ToggleIndicator({ children, fallback, ...props }: ToggleIndicatorProps) {
  const { pressed, size } = useToggleContext()
  const { colors, typography } = useNativeTheme()
  const content = pressed ? children : fallback
  return (
    <View {...props}>
      {Children.map(content, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <AnimatedText
            style={{
              ...typography.medium,
              fontSize: size === "sm" ? 12.8 : 14,
              lineHeight: 20,
              color: colors.foreground,
            }}
          >
            {child}
          </AnimatedText>
        ) : isValidElement<{ size?: number; color?: string }>(child) ? (
          cloneElement(child, {
            size: child.props.size ?? (size === "sm" ? 14 : 16),
            color: child.props.color ?? colors.foreground,
          })
        ) : (
          child
        )
      )}
    </View>
  )
}
export type ToggleContextProps = {
  /** Receives the current toggle state. */ children: (state: UseToggleReturn) => ReactNode
}
function ToggleContext({ children }: ToggleContextProps) {
  return children(useToggleContext())
}

export const Toggle = { Root: ToggleRoot, Indicator: ToggleIndicator, Context: ToggleContext }
