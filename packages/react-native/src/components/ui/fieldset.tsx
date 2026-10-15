/** Groups related fields with a legend, description, and inherited disabled state. */
import { createContext, useContext, type ComponentPropsWithRef, type ReactNode } from "react"
import { Text, View } from "react-native"
import { useNativeTheme } from "../../lib/theme"

const FieldsetState = createContext({ disabled: false, invalid: false })
export const useFieldsetContext = () => useContext(FieldsetState)
export type FieldsetRootProps = ComponentPropsWithRef<typeof View> & { disabled?: boolean; invalid?: boolean }
function FieldsetRoot({ disabled = false, invalid = false, style, ...props }: FieldsetRootProps) {
  const parent = useFieldsetContext()
  return (
    <FieldsetState value={{ disabled: parent.disabled || disabled, invalid }}>
      <View {...props} style={[{ minWidth: 0, gap: 16 }, style]} />
    </FieldsetState>
  )
}
export type FieldsetLegendProps = ComponentPropsWithRef<typeof Text>
function FieldsetLegend({ style, ...props }: FieldsetLegendProps) {
  const { typography, fontSize, lineHeight, colors } = useNativeTheme()
  return (
    <Text
      accessibilityRole="header"
      {...props}
      style={[
        {
          ...typography.medium,
          fontSize: fontSize.body,
          lineHeight: lineHeight.body,
          color: colors.foreground,
          // HTML legends sit outside the fieldset flex flow: cancel its 16px gap.
          marginBottom: -10,
        },
        style,
      ]}
    />
  )
}
export type FieldsetHelperTextProps = ComponentPropsWithRef<typeof Text>
function FieldsetHelperText({ style, ...props }: FieldsetHelperTextProps) {
  const { typography, fontSize, colors } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        { ...typography.regular, fontSize: fontSize.md, lineHeight: 21, color: colors.mutedForeground, marginTop: -6 },
        style,
      ]}
    />
  )
}
export type FieldsetErrorTextProps = ComponentPropsWithRef<typeof Text>
function FieldsetErrorText({ style, ...props }: FieldsetErrorTextProps) {
  const { invalid } = useFieldsetContext()
  const { typography, fontSize, lineHeight, colors } = useNativeTheme()
  if (!invalid) return null
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      {...props}
      style={[
        { ...typography.regular, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.destructive },
        style,
      ]}
    />
  )
}
export type FieldsetContextProps = { children: (state: ReturnType<typeof useFieldsetContext>) => ReactNode }
function FieldsetContext({ children }: FieldsetContextProps) {
  return children(useFieldsetContext())
}
export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  HelperText: FieldsetHelperText,
  ErrorText: FieldsetErrorText,
  Context: FieldsetContext,
}
