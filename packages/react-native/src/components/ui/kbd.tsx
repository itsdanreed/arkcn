import { Children, cloneElement, isValidElement, type ComponentPropsWithRef } from "react"
import { I18nManager, Text, View, type StyleProp, type TextStyle } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type KbdRootProps = ComponentPropsWithRef<typeof View> & {
  /** Use inside an inverse tooltip surface. No tooltip is created by this component. */
  variant?: "default" | "tooltip"
  textStyle?: StyleProp<TextStyle>
}
function KbdRoot({ variant = "default", children, style, textStyle, ...props }: KbdRootProps) {
  const { colors, colorScheme, typography, radius } = useNativeTheme()
  const color = variant === "tooltip" ? colors.background : colors.mutedForeground
  return (
    <View
      {...props}
      pointerEvents="none"
      style={[
        {
          minHeight: 20,
          minWidth: 20,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          paddingHorizontal: 4,
          borderRadius: radius.sm,
          backgroundColor:
            variant === "tooltip" ? withOpacity(colors.background, colorScheme === "dark" ? 0.1 : 0.2) : colors.muted,
        },
        style,
      ]}
    >
      {Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text selectable={false} style={[{ ...typography.medium, fontSize: 12, lineHeight: 16, color }, textStyle]}>
            {child}
          </Text>
        ) : isValidElement<{ size?: number; color?: string }>(child) ? (
          cloneElement(child, { size: child.props.size ?? 12, color: child.props.color ?? color })
        ) : (
          child
        )
      )}
    </View>
  )
}
export type KbdGroupProps = ComponentPropsWithRef<typeof View>
function KbdGroup({ style, ...props }: KbdGroupProps) {
  return (
    <View
      {...props}
      style={[{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }, style]}
    />
  )
}
export const Kbd = { Root: KbdRoot, Group: KbdGroup }
