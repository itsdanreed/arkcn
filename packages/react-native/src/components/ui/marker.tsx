/** Muted icon labels and conversation dividers, matching the web Marker. */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { AnimatedPressable, useShadowTransition } from "../../lib/motion"
import { isFocusVisible } from "../../lib/focus"

type Variant = "default" | "separator" | "border"
const Layout = createContext({ variant: "default" as Variant, link: false, active: false })
export type MarkerRootProps = Omit<ComponentPropsWithRef<typeof Pressable>, "children" | "style"> & {
  variant?: Variant
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}
function Root({
  variant = "default",
  style,
  children,
  disabled,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  accessibilityState,
  ...props
}: MarkerRootProps) {
  const { colors } = useNativeTheme()
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const interactive = !!(onPress || onLongPress)
  const link = props.accessibilityRole === "link"
  const shadow = useShadowTransition([
    {
      offsetX: 0,
      offsetY: 0,
      spreadDistance: focused && !disabled ? 2 : 0,
      color: withOpacity(colors.ring, focused && !disabled ? 0.5 : 0),
    },
  ])
  const box: StyleProp<ViewStyle> = [
    {
      minHeight: 16,
      width: "100%",
      minWidth: 0,
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      ...(variant === "border" ? { borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 8 } : {}),
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ]
  const line = (side: "start" | "end") => (
    <View
      accessible={false}
      pointerEvents="none"
      style={{
        flex: 1,
        minWidth: 0,
        height: 1,
        backgroundColor: colors.border,
        ...(side === "start" ? { marginEnd: 4 } : { marginStart: 4 }),
      }}
    />
  )
  const content = (
    <Layout.Provider value={{ variant, link, active: !disabled && (pressed || hovered) }}>
      {variant === "separator" && line("start")}
      {Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? <Content>{child}</Content> : child
      )}
      {variant === "separator" && line("end")}
    </Layout.Provider>
  )
  if (!interactive)
    return (
      <View {...props} accessibilityState={accessibilityState} style={box}>
        {content}
      </View>
    )
  return (
    <AnimatedPressable
      accessibilityRole="button"
      hitSlop={{ top: 12, bottom: 12, left: 0, right: 0 }}
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPress={(event) => {
        if (!disabled) onPress?.(event)
      }}
      onLongPress={(event) => {
        if (!disabled) onLongPress?.(event)
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
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[box, shadow]}
    >
      {content}
    </AnimatedPressable>
  )
}
export type MarkerIconProps = ComponentPropsWithRef<typeof View>
function Icon({ children, style, ...props }: MarkerIconProps) {
  const { colors } = useNativeTheme()
  const { active } = useContext(Layout)
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: 16, height: 16, flexShrink: 0, alignItems: "center", justifyContent: "center" }, style]}
    >
      {Children.map(children, (child) =>
        isValidElement<{ size?: number; color?: string }>(child)
          ? cloneElement(child, {
              size: child.props.size ?? 16,
              color: child.props.color ?? (active ? colors.foreground : colors.mutedForeground),
            })
          : child
      )}
    </View>
  )
}
export type MarkerContentProps = ComponentPropsWithRef<typeof Text>
function Content({ style, ...props }: MarkerContentProps) {
  const { colors, typography } = useNativeTheme()
  const { variant, link, active } = useContext(Layout)
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.regular,
          minWidth: 0,
          flexShrink: 1,
          fontSize: 14,
          lineHeight: 20,
          color: active ? colors.foreground : colors.mutedForeground,
          textAlign: variant === "separator" ? "center" : "auto",
          textDecorationLine: link ? "underline" : "none",
        },
        style,
      ]}
    />
  )
}
export const Marker = { Root, Icon, Content }
