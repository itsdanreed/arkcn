/** Joined buttons, labels, and separators with horizontal or vertical composition. */
import { Children, cloneElement, isValidElement, type ComponentPropsWithRef, type ReactNode } from "react"
import { Text, View, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native"
import { useNativeTheme } from "../../lib/theme"
import { Separator, type SeparatorRootProps } from "./separator"
export type ButtonGroupRootProps = ComponentPropsWithRef<typeof View> & {
  /** Direction in which controls join. */
  orientation?: "horizontal" | "vertical"
}
function ButtonGroupRoot({ orientation = "horizontal", children, style, ...props }: ButtonGroupRootProps) {
  const { radius, spacing } = useNativeTheme()
  const items = Children.toArray(children)
  const vertical = orientation === "vertical"
  const nested = items.some((child) => isValidElement(child) && child.type === ButtonGroupRoot)
  return (
    <View
      {...props}
      style={[
        {
          alignSelf: "flex-start",
          flexDirection: vertical ? "column" : "row",
          alignItems: "stretch",
          gap: nested ? spacing.sm : 0,
        },
        style,
      ]}
    >
      {items.map((child, index) => {
        if (
          !isValidElement<{
            style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
          }>(child)
        )
          return child
        const first = index === 0,
          last = index === items.length - 1
        const joined: ViewStyle = vertical
          ? {
              borderRadius: radius.lg,
              ...(!first && { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0 }),
              ...(!last && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }),
            }
          : {
              borderRadius: radius.lg,
              ...(!first && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }),
              ...(!last && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
            }
        const childStyle = child.props.style
        return cloneElement(child, {
          style:
            typeof childStyle === "function"
              ? (state: PressableStateCallbackType) => [joined, childStyle(state)]
              : [joined, childStyle],
        })
      })}
    </View>
  )
}
export type ButtonGroupTextProps = ComponentPropsWithRef<typeof View>
function ButtonGroupText({ children, style, ...props }: ButtonGroupTextProps) {
  const { colors, typography, spacing, radius, fontSize, lineHeight } = useNativeTheme()
  const label = (content: ReactNode) => (
    <Text style={{ ...typography.medium, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.foreground }}>
      {content}
    </Text>
  )
  const items = Children.toArray(children)
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
          paddingHorizontal: spacing.controlX,
        },
        style,
      ]}
    >
      {items.every((child) => typeof child === "string" || typeof child === "number")
        ? label(children)
        : Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number"
              ? label(child)
              : isValidElement<{ size?: number; color?: string }>(child)
                ? cloneElement(child, { size: child.props.size ?? 16, color: child.props.color ?? colors.foreground })
                : child
          )}
    </View>
  )
}
export type ButtonGroupSeparatorProps = SeparatorRootProps
function ButtonGroupSeparator({ orientation = "vertical", style, ...props }: ButtonGroupSeparatorProps) {
  const { colors } = useNativeTheme()
  return (
    <Separator.Root
      {...props}
      orientation={orientation}
      style={[
        { backgroundColor: colors.input },
        orientation === "vertical" ? { marginVertical: 1 } : { marginHorizontal: 1 },
        style,
      ]}
    />
  )
}
export const ButtonGroup = { Root: ButtonGroupRoot, Text: ButtonGroupText, Separator: ButtonGroupSeparator }
