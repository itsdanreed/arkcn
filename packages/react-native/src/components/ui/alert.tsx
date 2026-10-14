import { Children, createContext, isValidElement, useContext, type ReactNode, type ComponentPropsWithRef } from "react"
import { Text, View } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"

/** Inline status messages with shared card surfaces and default/destructive variants. */
export type AlertRootProps = ComponentPropsWithRef<typeof View> & {
  variant?: "default" | "destructive"
  icon?: ReactNode
}
const Variant = createContext<"default" | "destructive">("default")
function AlertRoot({ variant = "default", style, children, icon, ...props }: AlertRootProps) {
  const { colors, spacing, radius } = useNativeTheme()
  const hasAction = Children.toArray(children).some((child) => isValidElement(child) && child.type === AlertAction)
  return (
    <Variant.Provider value={variant}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        {...props}
        style={[
          {
            width: "100%",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            paddingHorizontal: spacing.controlX,
            paddingVertical: spacing.sm,
            gap: spacing.half,
            ...(hasAction ? { paddingRight: spacing.xl * 3 } : {}),
          },
          style,
        ]}
      >
        {icon ? (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ marginTop: spacing.half }}>{icon}</View>
            <View style={{ flex: 1, gap: spacing.half }}>{children}</View>
          </View>
        ) : (
          children
        )}
      </View>
    </Variant.Provider>
  )
}
export type AlertTitleProps = ComponentPropsWithRef<typeof Text>
function AlertTitle({ style, ...props }: AlertTitleProps) {
  const variant = useContext(Variant)
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.medium,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
          color: variant === "destructive" ? colors.destructive : colors.cardForeground,
        },
        style,
      ]}
    />
  )
}
export type AlertDescriptionProps = ComponentPropsWithRef<typeof Text>
function AlertDescription({ style, ...props }: AlertDescriptionProps) {
  const variant = useContext(Variant)
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.regular,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
          color: variant === "destructive" ? withOpacity(colors.destructive, 0.9) : colors.mutedForeground,
        },
        style,
      ]}
    />
  )
}
export type AlertActionProps = ComponentPropsWithRef<typeof View>
function AlertAction({ style, ...props }: AlertActionProps) {
  const { spacing } = useNativeTheme()
  return <View {...props} style={[{ position: "absolute", top: spacing.sm, right: spacing.sm }, style]} />
}
export const Alert = { Root: AlertRoot, Title: AlertTitle, Description: AlertDescription, Action: AlertAction }
