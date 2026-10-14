import { isFocusVisible } from "../../lib/focus"
import { Check, Minus } from "lucide-react-native"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useState, type ComponentPropsWithRef } from "react"
import { Pressable, Text, View } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme, withOpacity } from "../../lib/theme"

/** A composable checkbox with checked, unchecked, and indeterminate states. */
export type CheckboxCheckedState = boolean | "indeterminate"
export type CheckboxRootProps = ComponentPropsWithRef<typeof Pressable> & {
  checked?: CheckboxCheckedState
  defaultChecked?: CheckboxCheckedState
  onCheckedChange?: (details: { checked: CheckboxCheckedState }) => void
  readOnly?: boolean
  invalid?: boolean
}
const [Provider, useCheckbox] = createRequiredContext<{
  checked: CheckboxCheckedState
  invalid: boolean
  focused: boolean
}>("Checkbox")
function CheckboxRoot({
  checked,
  defaultChecked = false,
  onCheckedChange,
  readOnly = false,
  invalid = false,
  disabled,
  onPress,
  onFocus,
  onBlur,
  style,
  accessibilityState,
  ...props
}: CheckboxRootProps) {
  const [value, setValue] = useControllable(checked, defaultChecked, (checked) => onCheckedChange?.({ checked }))
  const [focused, setFocused] = useState(false)
  const { spacing, opacity, selection, minimumTouchTarget } = useNativeTheme()
  return (
    <Provider value={{ checked: value, invalid, focused }}>
      <Pressable
        accessible
        accessibilityRole="checkbox"
        hitSlop={(minimumTouchTarget - selection.size) / 2}
        {...props}
        aria-checked={value === "indeterminate" ? "mixed" : value}
        aria-disabled={!!disabled}
        disabled={disabled || readOnly}
        accessibilityState={{
          ...accessibilityState,
          checked: value === "indeterminate" ? "mixed" : value,
          disabled: !!disabled,
        }}
        onPress={(event) => {
          if (disabled || readOnly) return
          onPress?.(event)
          if (!event.defaultPrevented) setValue(value !== true)
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
export type CheckboxControlProps = ComponentPropsWithRef<typeof View>
function CheckboxControl({ style, children, ...props }: CheckboxControlProps) {
  const { checked, invalid, focused } = useCheckbox()
  const { colors, colorScheme, selection } = useNativeTheme()
  const { transition } = useMotion()
  return (
    <AnimatedView
      {...props}
      style={[
        transition(["backgroundColor", "borderColor"]),
        {
          width: selection.size,
          height: selection.size,
          flexShrink: 0,
          borderRadius: selection.checkboxRadius,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: checked
            ? colors.primary
            : colorScheme === "dark"
              ? withOpacity(colors.input, 0.3)
              : "transparent",
          borderColor: invalid
            ? checked
              ? colors.primary
              : colorScheme === "dark"
                ? withOpacity(colors.destructive, 0.5)
                : colors.destructive
            : focused
              ? colors.ring
              : checked
                ? colors.primary
                : colors.input,
          boxShadow:
            invalid || focused
              ? `0 0 0 3px ${withOpacity(invalid ? colors.destructive : colors.ring, invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : 0.5)}`
              : "none",
        },
        style,
      ]}
    >
      {children ?? <CheckboxIndicator />}
    </AnimatedView>
  )
}
export type CheckboxIndicatorProps = ComponentPropsWithRef<typeof View>
function CheckboxIndicator({ style, children, ...props }: CheckboxIndicatorProps) {
  const { checked } = useCheckbox()
  const { colors } = useNativeTheme()
  if (!checked) return null
  return (
    <View accessible={false} {...props} style={[{ alignItems: "center", justifyContent: "center" }, style]}>
      {children ??
        (checked === "indeterminate" ? (
          <Minus size={14} color={colors.primaryForeground} aria-hidden />
        ) : (
          <Check size={14} color={colors.primaryForeground} aria-hidden />
        ))}
    </View>
  )
}
export type CheckboxLabelProps = ComponentPropsWithRef<typeof Text>
function CheckboxLabel({ style, ...props }: CheckboxLabelProps) {
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
export const Checkbox = {
  Root: CheckboxRoot,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
}
