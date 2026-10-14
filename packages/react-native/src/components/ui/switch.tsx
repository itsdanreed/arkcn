import { isFocusVisible } from "../../lib/focus"
import { AnimatedView, useMotion, useShadowTransition } from "../../lib/motion"
import { useState, type ComponentPropsWithRef } from "react"
import { Pressable, Text, View } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme, withOpacity } from "../../lib/theme"

/** Compact switches with the same track, thumb, and checked colors as the web renderer. */
export type SwitchRootProps = ComponentPropsWithRef<typeof Pressable> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (details: { checked: boolean }) => void
  readOnly?: boolean
  invalid?: boolean
  size?: "default" | "sm"
}
const [Provider, useSwitch] = createRequiredContext<{
  checked: boolean
  focused: boolean
  invalid: boolean
  size: "default" | "sm"
}>("Switch")
function SwitchRoot({
  checked,
  defaultChecked = false,
  onCheckedChange,
  readOnly = false,
  invalid = false,
  size = "default",
  disabled,
  onPress,
  onFocus,
  onBlur,
  accessibilityState,
  style,
  ...props
}: SwitchRootProps) {
  const [value, setValue] = useControllable(checked, defaultChecked, (checked) => onCheckedChange?.({ checked }))
  const [focused, setFocused] = useState(false)
  const { spacing, opacity, switches, minimumTouchTarget } = useNativeTheme()
  return (
    <Provider value={{ checked: value, focused, invalid, size }}>
      <Pressable
        accessible
        accessibilityRole="switch"
        hitSlop={(minimumTouchTarget - switches[size].height) / 2}
        {...props}
        aria-checked={value}
        aria-disabled={!!disabled}
        disabled={disabled || readOnly}
        accessibilityState={{ ...accessibilityState, checked: value, disabled: !!disabled }}
        onPress={(event) => {
          if (disabled || readOnly) return
          onPress?.(event)
          if (!event.defaultPrevented) setValue(!value)
        }}
        onFocus={(event) => {
          setFocused(isFocusVisible(event))
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        style={(state) => [
          {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            opacity: disabled ? opacity.disabled : 1,
          },
          typeof style === "function" ? style(state) : style,
        ]}
      />
    </Provider>
  )
}
export type SwitchControlProps = ComponentPropsWithRef<typeof View>
function SwitchControl({ style, children, ...props }: SwitchControlProps) {
  const { checked, focused, invalid, size } = useSwitch()
  const { colors, colorScheme, switches, radius } = useNativeTheme()
  const metrics = switches[size]
  const { transition } = useMotion()
  const animatedShadow = useShadowTransition([
    {
      offsetX: 0,
      offsetY: 0,
      spreadDistance: invalid || focused ? 3 : 0,
      color: withOpacity(
        invalid ? colors.destructive : colors.ring,
        invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : focused ? 0.5 : 0
      ),
    },
  ])
  return (
    <AnimatedView
      {...props}
      style={[
        transition("all"),
        {
          width: metrics.width,
          height: metrics.height,
          borderRadius: radius.full,
          borderWidth: 1,
          borderColor: invalid
            ? colorScheme === "dark"
              ? withOpacity(colors.destructive, 0.5)
              : colors.destructive
            : focused
              ? colors.ring
              : "transparent",
          justifyContent: "center",
          backgroundColor: checked
            ? colors.primary
            : colorScheme === "dark"
              ? withOpacity(colors.input, 0.8)
              : colors.input,
        },
        animatedShadow,
        style,
      ]}
    >
      {children ?? <SwitchThumb />}
    </AnimatedView>
  )
}
export type SwitchThumbProps = ComponentPropsWithRef<typeof View>
function SwitchThumb({ style, ...props }: SwitchThumbProps) {
  const { checked, size } = useSwitch()
  const { colors, colorScheme, switches, radius } = useNativeTheme()
  const metrics = switches[size]
  const { transition } = useMotion()
  return (
    <AnimatedView
      accessible={false}
      {...props}
      style={[
        transition(["transform"]),
        {
          width: metrics.thumb,
          height: metrics.thumb,
          borderRadius: radius.full,
          backgroundColor:
            colorScheme === "dark" ? (checked ? colors.primaryForeground : colors.foreground) : colors.background,
          transform: [{ translateX: checked ? metrics.width - metrics.thumb - 2 : 0 }],
        },
        style,
      ]}
    />
  )
}
export type SwitchLabelProps = ComponentPropsWithRef<typeof Text>
function SwitchLabel({ style, ...props }: SwitchLabelProps) {
  const { colors, fontSize, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.regular,
          color: colors.foreground,
          fontSize: fontSize.md,
          lineHeight: fontSize.md,
          flexShrink: 1,
        },
        style,
      ]}
    />
  )
}
export const Switch = { Root: SwitchRoot, Control: SwitchControl, Thumb: SwitchThumb, Label: SwitchLabel }
