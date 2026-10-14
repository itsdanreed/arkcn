import { isFocusVisible } from "../../lib/focus"
import { useState, type ComponentPropsWithRef } from "react"
import { Pressable, Text, View } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme, withOpacity } from "../../lib/theme"

/** Single-choice fields with controlled state and accessible, individually disabled options. */
export type RadioGroupRootProps = ComponentPropsWithRef<typeof View> & {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string }) => void
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
}
const [Provider, useGroup] = createRequiredContext<{
  value: string
  setValue: (value: string) => void
  disabled: boolean
  readOnly: boolean
  invalid: boolean
}>("RadioGroup")
const [ItemProvider, useItem] = createRequiredContext<{ checked: boolean; focused: boolean; invalid: boolean }>(
  "RadioGroup.Item"
)
function RadioGroupRoot({
  value,
  defaultValue = "",
  onValueChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  style,
  ...props
}: RadioGroupRootProps) {
  const [selected, setValue] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  const { spacing } = useNativeTheme()
  return (
    <Provider value={{ value: selected, setValue, disabled, readOnly, invalid }}>
      <View accessibilityRole="radiogroup" {...props} style={[{ width: "100%", gap: spacing.sm }, style]} />
    </Provider>
  )
}
export type RadioGroupItemProps = ComponentPropsWithRef<typeof Pressable> & { value: string }
function RadioGroupItem({
  value,
  disabled,
  children,
  onPress,
  onFocus,
  onBlur,
  style,
  accessibilityState,
  ...props
}: RadioGroupItemProps) {
  const group = useGroup()
  const [focused, setFocused] = useState(false)
  const checked = group.value === value
  const blocked = !!(disabled || group.disabled)
  const { spacing, opacity, selection, minimumTouchTarget } = useNativeTheme()
  return (
    <ItemProvider value={{ checked, focused, invalid: group.invalid }}>
      <Pressable
        accessible
        accessibilityRole="radio"
        hitSlop={(minimumTouchTarget - selection.size) / 2}
        {...props}
        aria-checked={checked}
        aria-disabled={blocked}
        disabled={blocked || group.readOnly}
        accessibilityState={{ ...accessibilityState, checked, disabled: blocked }}
        onPress={(event) => {
          if (blocked || group.readOnly) return
          onPress?.(event)
          if (!event.defaultPrevented) group.setValue(value)
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
            opacity: blocked ? opacity.disabled : 1,
          },
          typeof style === "function" ? style(state) : style,
        ]}
      >
        {(state) => {
          const content = typeof children === "function" ? children(state) : children
          return typeof content === "string" || typeof content === "number" ? (
            <>
              <RadioGroupItemControl />
              <RadioGroupItemText>{content}</RadioGroupItemText>
            </>
          ) : (
            content
          )
        }}
      </Pressable>
    </ItemProvider>
  )
}
export type RadioGroupItemControlProps = ComponentPropsWithRef<typeof View>
function RadioGroupItemControl({ children, style, ...props }: RadioGroupItemControlProps) {
  const { checked, focused, invalid } = useItem()
  const { colors, colorScheme, selection, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: selection.size,
          height: selection.size,
          flexShrink: 0,
          borderRadius: radius.full,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
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
          backgroundColor: checked
            ? colors.primary
            : colorScheme === "dark"
              ? withOpacity(colors.input, 0.3)
              : "transparent",
          boxShadow:
            invalid || focused
              ? `0 0 0 3px ${withOpacity(invalid ? colors.destructive : colors.ring, invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : 0.5)}`
              : "none",
        },
        style,
      ]}
    >
      {children ??
        (checked && (
          <View
            style={{
              width: selection.dotSize,
              height: selection.dotSize,
              borderRadius: radius.full,
              backgroundColor: colors.primaryForeground,
            }}
          />
        ))}
    </View>
  )
}
export type RadioGroupItemTextProps = ComponentPropsWithRef<typeof Text>
function RadioGroupItemText({ style, ...props }: RadioGroupItemTextProps) {
  const { colors, typography, fontSize } = useNativeTheme()
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
export type RadioGroupLabelProps = ComponentPropsWithRef<typeof Text>
function RadioGroupLabel({ style, ...props }: RadioGroupLabelProps) {
  const { typography } = useNativeTheme()
  return <RadioGroupItemText {...props} style={[typography.medium, style]} />
}
export const RadioGroup = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  ItemControl: RadioGroupItemControl,
  ItemText: RadioGroupItemText,
  Label: RadioGroupLabel,
}
