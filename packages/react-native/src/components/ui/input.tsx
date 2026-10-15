import { useState, type ComponentPropsWithRef } from "react"
import { AnimatedTextInput, useMotion } from "../../lib/motion"
import { Platform, TextInput } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type InputRootProps = ComponentPropsWithRef<typeof TextInput> & { disabled?: boolean; invalid?: boolean }

function InputRoot({
  style,
  disabled = false,
  invalid = false,
  editable,
  onFocus,
  onBlur,
  accessibilityState,
  ...props
}: InputRootProps) {
  const { transition } = useMotion()
  const [focused, setFocused] = useState(false)
  const { colors, colorScheme, spacing, radius, fontSize, lineHeight, controlHeight, opacity, typography } =
    useNativeTheme()
  const ringColor = withOpacity(
    invalid ? colors.destructive : colors.ring,
    invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : focused ? 0.5 : 0
  )
  const ringVisible = invalid || focused
  const ring = { boxShadow: ringVisible ? `0px 0px 0px 3px ${ringColor}` : "none" }
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      placeholderTextColor={colors.mutedForeground}
      selectionColor={colors.ring}
      {...props}
      editable={!disabled && editable !== false}
      accessibilityState={{ ...accessibilityState, disabled: disabled || accessibilityState?.disabled }}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        transition(["borderColor", "backgroundColor"]),
        {
          minHeight: controlHeight.default,
          ...(!props.multiline ? { height: controlHeight.default } : {}),
          paddingHorizontal: spacing.controlX,
          paddingVertical: spacing.xs,
          backgroundColor: disabled
            ? withOpacity(colors.input, colorScheme === "dark" ? 0.8 : 0.5)
            : colorScheme === "dark"
              ? withOpacity(colors.input, 0.3)
              : "transparent",
          color: colors.foreground,
          borderWidth: 1,
          borderColor: invalid
            ? colorScheme === "dark"
              ? withOpacity(colors.destructive, 0.5)
              : colors.destructive
            : focused
              ? colors.ring
              : colors.input,
          borderRadius: radius.lg,
          ...typography.regular,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
          includeFontPadding: false,
          opacity: disabled ? opacity.disabled : 1,
        },
        ring,
        Platform.OS === "web" && { outlineWidth: 0 },
        style,
      ]}
    />
  )
}
/** Native text entry using value/onChangeText; label with accessibilityLabel. */
export const Input = { Root: InputRoot }
