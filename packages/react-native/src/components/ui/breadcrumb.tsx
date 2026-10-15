import { Children, createContext, useContext, useState, type ComponentPropsWithRef } from "react"
import { I18nManager, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native"
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react-native"
import { AnimatedPressable, AnimatedText, useMotion } from "../../lib/motion"
import { useNativeTheme } from "../../lib/theme"

const DirectionContext = createContext<"ltr" | "rtl" | undefined>(undefined)
function useDirection() {
  return useContext(DirectionContext) ?? (I18nManager.isRTL ? "rtl" : "ltr")
}
export type BreadcrumbRootProps = ComponentPropsWithRef<typeof View> & { dir?: "ltr" | "rtl" }
function BreadcrumbRoot({ dir = I18nManager.isRTL ? "rtl" : "ltr", ...props }: BreadcrumbRootProps) {
  return (
    <DirectionContext.Provider value={dir}>
      <View accessibilityLabel="Breadcrumb" {...props} />
    </DirectionContext.Provider>
  )
}
export type BreadcrumbListProps = ComponentPropsWithRef<typeof View>
function BreadcrumbList({ style, ...props }: BreadcrumbListProps) {
  const dir = useDirection()
  return (
    <View
      {...props}
      style={[
        { flexDirection: dir === "rtl" ? "row-reverse" : "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
        style,
      ]}
    />
  )
}
export type BreadcrumbItemProps = ComponentPropsWithRef<typeof View>
function BreadcrumbItem({ style, ...props }: BreadcrumbItemProps) {
  const dir = useDirection()
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: dir === "rtl" ? "row-reverse" : "row",
          alignItems: "center",
          gap: 4,
          maxWidth: "100%",
          flexShrink: 1,
        },
        style,
      ]}
    />
  )
}
export type BreadcrumbLinkProps = ComponentPropsWithRef<typeof Pressable> & { textStyle?: StyleProp<TextStyle> }
function BreadcrumbLink({
  children,
  style,
  textStyle,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  accessibilityState,
  ...props
}: BreadcrumbLinkProps) {
  const { colors, typography } = useNativeTheme()
  const { transition } = useMotion()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const dir = useDirection()
  return (
    <AnimatedPressable
      accessibilityRole="link"
      hitSlop={{ top: 12, bottom: 12, left: 0, right: 0 }}
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPress={(event) => {
        if (!disabled) onPress?.(event)
      }}
      onPressIn={(event) => {
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        onPressOut?.(event)
      }}
      onHoverIn={(event) => {
        setHovered(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        onHoverOut?.(event)
      }}
      style={[
        {
          flexShrink: 1,
          flexDirection: dir === "rtl" ? "row-reverse" : "row",
          alignItems: "center",
          gap: 4,
          opacity: disabled ? 0.5 : 1,
        },
        StyleSheet.flatten(typeof style === "function" ? style({ pressed }) : style),
      ]}
    >
      {(state) =>
        Children.map(typeof children === "function" ? children(state) : children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <AnimatedText
              style={[
                transition("all"),
                {
                  ...typography.regular,
                  fontSize: 14,
                  lineHeight: 20,
                  flexShrink: 1,
                  color: !disabled && (hovered || pressed) ? colors.foreground : colors.mutedForeground,
                },
                textStyle,
              ]}
            >
              {child}
            </AnimatedText>
          ) : (
            child
          )
        )
      }
    </AnimatedPressable>
  )
}
export type BreadcrumbPageProps = ComponentPropsWithRef<typeof Text>
function BreadcrumbPage({ style, accessibilityState, ...props }: BreadcrumbPageProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      accessibilityRole="link"
      accessibilityHint="Current page"
      {...props}
      disabled
      accessibilityState={{ ...accessibilityState, disabled: true, selected: true }}
      style={[{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground, flexShrink: 1 }, style]}
    />
  )
}
export type BreadcrumbSeparatorProps = ComponentPropsWithRef<typeof View>
function BreadcrumbSeparator({ children, style, ...props }: BreadcrumbSeparatorProps) {
  const { colors, typography } = useNativeTheme()
  const Icon = useDirection() === "rtl" ? ChevronLeft : ChevronRight
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ alignItems: "center", justifyContent: "center", flexShrink: 0 }, style]}
    >
      {children == null ? (
        <Icon size={14} color={colors.mutedForeground} accessible={false} />
      ) : typeof children === "string" || typeof children === "number" ? (
        <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}
export type BreadcrumbEllipsisProps = ComponentPropsWithRef<typeof View>
function BreadcrumbEllipsis({ children, style, ...props }: BreadcrumbEllipsisProps) {
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: 20, height: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 }, style]}
    >
      {children ?? <Ellipsis size={16} color={colors.mutedForeground} accessible={false} />}
    </View>
  )
}
export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
}
