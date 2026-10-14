import type { ComponentPropsWithRef } from "react"
import { Text } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type BadgeRootProps = ComponentPropsWithRef<typeof Text> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
}
function BadgeRoot({ variant = "default", style, ...props }: BadgeRootProps) {
  const { colors, colorScheme, badge, fontSize, typography } = useNativeTheme()
  const color =
    variant === "default"
      ? colors.primaryForeground
      : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
          ? colors.secondaryForeground
          : variant === "link"
            ? colors.primary
            : colors.foreground
  const backgroundColor =
    variant === "default"
      ? colors.primary
      : variant === "destructive"
        ? withOpacity(colors.destructive, colorScheme === "dark" ? 0.2 : 0.1)
        : variant === "secondary"
          ? colors.secondary
          : "transparent"
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.medium,
          color,
          backgroundColor,
          alignSelf: "flex-start",
          overflow: "hidden",
          borderRadius: badge.radius,
          paddingHorizontal: badge.paddingX,
          paddingVertical: badge.paddingY,
          borderWidth: 1,
          borderColor: variant === "outline" ? colors.border : "transparent",
          fontSize: fontSize.sm,
          lineHeight: badge.height - 2 * badge.paddingY - 2,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  )
}
/** The same compact label and six visual variants as the web badge. */
export const Badge = { Root: BadgeRoot }
