import { Children, createContext, isValidElement, useContext, type ComponentPropsWithRef } from "react"
import { Text, View } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type CardRootProps = ComponentPropsWithRef<typeof View> & { size?: "default" | "sm" }
export type CardHeaderProps = ComponentPropsWithRef<typeof View>
export type CardContentProps = ComponentPropsWithRef<typeof View>
export type CardFooterProps = ComponentPropsWithRef<typeof View>
export type CardActionProps = ComponentPropsWithRef<typeof View>
export type CardTitleProps = ComponentPropsWithRef<typeof Text>
export type CardDescriptionProps = ComponentPropsWithRef<typeof Text>
const CardSize = createContext<"default" | "sm">("default")
function useCardSpacing() {
  const { card } = useNativeTheme()
  return useContext(CardSize) === "sm" ? card.compactSpacing : card.spacing
}
function CardRoot({ size = "default", style, children, ...props }: CardRootProps) {
  const { colors, card } = useNativeTheme()
  const spacing = size === "sm" ? card.compactSpacing : card.spacing
  const hasFooter = Children.toArray(children).some((child) => isValidElement(child) && child.type === CardFooter)
  return (
    <CardSize.Provider value={size}>
      <View
        {...props}
        style={[
          {
            backgroundColor: colors.card,
            boxShadow: `0 0 0 1px ${withOpacity(colors.foreground, 0.1)}`,
            borderRadius: card.radius,
            overflow: "hidden",
            paddingTop: spacing,
            paddingBottom: hasFooter ? 0 : spacing,
            gap: spacing,
          },
          style,
        ]}
      >
        {children}
      </View>
    </CardSize.Provider>
  )
}
function CardHeader({ style, children, ...props }: CardHeaderProps) {
  const { spacing } = useNativeTheme()
  const padding = useCardSpacing()
  const nodes = Children.toArray(children)
  const actions = nodes.filter((child) => isValidElement(child) && child.type === CardAction)
  const content = nodes.filter((child) => !isValidElement(child) || child.type !== CardAction)
  return (
    <View
      {...props}
      style={[{ paddingHorizontal: padding, flexDirection: "row", alignItems: "flex-start", gap: spacing.xs }, style]}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>{content}</View>
      {actions}
    </View>
  )
}
function CardContent({ style, ...props }: CardContentProps) {
  const padding = useCardSpacing()
  return <View {...props} style={[{ paddingHorizontal: padding }, style]} />
}
function CardFooter({ style, ...props }: CardFooterProps) {
  const { colors, card } = useNativeTheme()
  const padding = useCardSpacing()
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          padding,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: withOpacity(colors.muted, 0.5),
          borderBottomLeftRadius: card.radius,
          borderBottomRightRadius: card.radius,
        },
        style,
      ]}
    />
  )
}
function CardAction({ style, ...props }: CardActionProps) {
  return <View {...props} style={[{ alignSelf: "flex-start" }, style]} />
}
function CardTitle({ style, ...props }: CardTitleProps) {
  const { colors, fontSize, lineHeight, typography } = useNativeTheme()
  const small = useContext(CardSize) === "sm"
  return (
    <Text
      accessibilityRole="header"
      {...props}
      style={[
        {
          ...typography.medium,
          color: colors.cardForeground,
          fontSize: small ? fontSize.md : fontSize.title,
          lineHeight: small ? lineHeight.md : lineHeight.title,
        },
        style,
      ]}
    />
  )
}
function CardDescription({ style, ...props }: CardDescriptionProps) {
  const { colors, fontSize, lineHeight, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        { ...typography.regular, color: colors.mutedForeground, fontSize: fontSize.md, lineHeight: lineHeight.md },
        style,
      ]}
    />
  )
}
/** Card surfaces, spacing, title typography, and footer treatment match the web renderer. */
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
  Action: CardAction,
  Title: CardTitle,
  Description: CardDescription,
}
