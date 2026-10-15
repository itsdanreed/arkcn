/** Compound list-row layout with the web Item's sizes and surfaces. */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { Image, Text, View } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Separator, type SeparatorRootProps } from "./separator"

type Size = "default" | "sm" | "xs"
const ItemLayout = createContext<{ size: Size; description: boolean }>({ size: "default", description: false })
function hasPart(children: ReactNode, match: (child: React.ReactElement<Record<string, unknown>>) => boolean): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<Record<string, unknown>>(child) &&
      (match(child) || hasPart(child.props.children as ReactNode, match))
  )
}
export type ItemRootProps = ComponentPropsWithRef<typeof View> & {
  size?: Size
  variant?: "default" | "outline" | "muted"
}
function ItemRoot({ size = "default", variant = "default", style, children, ...props }: ItemRootProps) {
  const { colors, radius } = useNativeTheme()
  let previousContent = false
  const content = Children.map(children, (child) => {
    const isContent = isValidElement<ItemContentProps>(child) && child.type === ItemContent
    const result = isContent ? cloneElement(child, { grow: child.props.grow ?? !previousContent }) : child
    previousContent = isContent
    return result
  })
  return (
    <ItemLayout.Provider value={{ size, description: hasPart(children, (child) => child.type === ItemDescription) }}>
      <View
        {...props}
        style={[
          {
            width: "100%",
            minWidth: 0,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: size === "xs" ? 8 : 10,
            paddingHorizontal: size === "xs" ? 10 : 12,
            paddingVertical: size === "xs" ? 8 : 10,
            borderWidth: 1,
            borderColor: variant === "outline" ? colors.border : "transparent",
            borderRadius: radius.lg,
            backgroundColor: variant === "muted" ? withOpacity(colors.muted, 0.5) : "transparent",
          },
          style,
        ]}
      >
        {content}
      </View>
    </ItemLayout.Provider>
  )
}
export type ItemGroupProps = ComponentPropsWithRef<typeof View> & {
  /** Set when rows are rendered inside custom components. */ size?: Size
}
function ItemGroup({ size, style, children, ...props }: ItemGroupProps) {
  const compact =
    size ??
    (hasPart(children, (child) => child.type === ItemRoot && child.props.size === "xs")
      ? "xs"
      : hasPart(children, (child) => child.type === ItemRoot && child.props.size === "sm")
        ? "sm"
        : "default")
  return (
    <View {...props} style={[{ width: "100%", gap: compact === "xs" ? 8 : compact === "sm" ? 10 : 16 }, style]}>
      {children}
    </View>
  )
}
export type ItemMediaProps = ComponentPropsWithRef<typeof View> & {
  variant?: "default" | "icon" | "image"
  /** Override automatic description alignment for custom content wrappers. */ align?: "auto" | "center" | "start"
}
function ItemMedia({ variant = "default", align = "auto", style, children, ...props }: ItemMediaProps) {
  const { colors, radius } = useNativeTheme()
  const { size, description } = useContext(ItemLayout)
  const start = align === "start" || (align === "auto" && description)
  const dimension = size === "xs" ? 24 : size === "sm" ? 32 : 40
  return (
    <View
      {...props}
      style={[
        { flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
        start && { alignSelf: "flex-start", transform: [{ translateY: 2 }] },
        variant === "image" && { width: dimension, height: dimension, borderRadius: radius.sm, overflow: "hidden" },
        style,
      ]}
    >
      {Children.map(children, (child) => {
        if (
          !isValidElement<{
            size?: number
            color?: string
            style?: ComponentPropsWithRef<typeof Image>["style"]
            resizeMode?: ComponentPropsWithRef<typeof Image>["resizeMode"]
          }>(child)
        )
          return child
        if (variant === "icon")
          return cloneElement(child, { size: child.props.size ?? 16, color: child.props.color ?? colors.foreground })
        if (variant === "image" && child.type === Image)
          return cloneElement(child, {
            resizeMode: child.props.resizeMode ?? "cover",
            style: [{ width: "100%", height: "100%" }, child.props.style],
          })
        return child
      })}
    </View>
  )
}
export type ItemContentProps = ComponentPropsWithRef<typeof View> & { grow?: boolean }
function ItemContent({ grow = true, style, ...props }: ItemContentProps) {
  const { size } = useContext(ItemLayout)
  return (
    <View
      {...props}
      style={[
        {
          minWidth: 0,
          flexGrow: grow ? 1 : 0,
          flexShrink: 1,
          flexBasis: grow ? 0 : "auto",
          gap: size === "xs" ? 0 : 4,
        },
        style,
      ]}
    />
  )
}
export type ItemTitleProps = ComponentPropsWithRef<typeof Text>
function ItemTitle({ style, ...props }: ItemTitleProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      numberOfLines={1}
      {...props}
      style={[{ ...typography.medium, color: colors.foreground, fontSize: 14, lineHeight: 19.25 }, style]}
    />
  )
}
export type ItemDescriptionProps = ComponentPropsWithRef<typeof Text>
function ItemDescription({ style, ...props }: ItemDescriptionProps) {
  const { colors, typography } = useNativeTheme()
  const small = useContext(ItemLayout).size === "xs"
  return (
    <Text
      numberOfLines={2}
      {...props}
      style={[
        {
          ...typography.regular,
          color: colors.mutedForeground,
          fontSize: small ? 12 : 14,
          lineHeight: small ? 18 : 21,
          textAlign: "auto",
        },
        style,
      ]}
    />
  )
}
export type ItemActionsProps = ComponentPropsWithRef<typeof View>
function ItemActions({ style, ...props }: ItemActionsProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} />
}
export type ItemHeaderProps = ComponentPropsWithRef<typeof View>
function ItemHeader({ style, ...props }: ItemHeaderProps) {
  return (
    <View
      {...props}
      style={[
        { flexBasis: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
        style,
      ]}
    />
  )
}
export type ItemFooterProps = ItemHeaderProps
function ItemFooter(props: ItemFooterProps) {
  return <ItemHeader {...props} />
}
export type ItemSeparatorProps = SeparatorRootProps
function ItemSeparator({ style, ...props }: ItemSeparatorProps) {
  return <Separator.Root orientation="horizontal" {...props} style={[{ marginVertical: 8 }, style]} />
}
export const Item = {
  Root: ItemRoot,
  Group: ItemGroup,
  Media: ItemMedia,
  Content: ItemContent,
  Title: ItemTitle,
  Description: ItemDescription,
  Actions: ItemActions,
  Header: ItemHeader,
  Footer: ItemFooter,
  Separator: ItemSeparator,
}
