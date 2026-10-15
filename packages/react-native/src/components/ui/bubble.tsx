/** Conversation bubbles with all web surfaces and measured reaction placement. */
import { createContext, useContext, useState, type ComponentPropsWithRef } from "react"
import { Pressable, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { MessageLayout, messageText } from "../../lib/message-layout"
import { bubbleTint } from "../../lib/bubble-color"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { AnimatedPressable, useMotion, useShadowTransition } from "../../lib/motion"
import { isFocusVisible } from "../../lib/focus"

type Variant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"
type ViewProps = ComponentPropsWithRef<typeof View>
const Layout = createContext({ variant: "default" as Variant, align: "start" as "start" | "end" })
export type BubbleRootProps = ViewProps & { variant?: Variant; align?: "start" | "end" }
function Root({ variant = "default", align, style, children, ...props }: BubbleRootProps) {
  const message = useContext(MessageLayout)
  const direction = align ?? message.align
  return (
    <Layout.Provider value={{ variant, align: direction }}>
      <View
        {...props}
        style={[
          {
            minWidth: 0,
            maxWidth: variant === "ghost" ? "100%" : "80%",
            alignSelf: direction === "end" ? "flex-end" : "flex-start",
            gap: 4,
          },
          style,
        ]}
      >
        {children}
      </View>
    </Layout.Provider>
  )
}
export type BubbleGroupProps = ViewProps
function Group({ style, ...props }: BubbleGroupProps) {
  return <View {...props} style={[{ minWidth: 0, gap: 8 }, style]} />
}
export type BubbleContentProps = Omit<ComponentPropsWithRef<typeof Pressable>, "children" | "style"> & {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}
function Content({
  style,
  textStyle,
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
}: BubbleContentProps) {
  const { variant, align } = useContext(Layout)
  const { colors, colorScheme, typography, radius } = useNativeTheme()
  const { transition } = useMotion()
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const interactive = !!(onPress || onLongPress)
  const feedback = interactive && !disabled && (active || hovered)
  const dark = colorScheme === "dark"
  const color =
    variant === "default"
      ? colors.primaryForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : variant === "destructive"
          ? colors.destructive
          : colors.foreground
  const backgroundColor =
    variant === "default"
      ? feedback
        ? withOpacity(colors.primary, 0.8)
        : colors.primary
      : variant === "secondary" || variant === "muted"
        ? feedback
          ? colors.secondaryHover
          : variant === "secondary"
            ? colors.secondary
            : colors.muted
        : variant === "tinted"
          ? bubbleTint(colors.primary, dark, feedback)
          : variant === "outline"
            ? feedback
              ? dark
                ? withOpacity(colors.input, 0.3)
                : colors.muted
              : colors.background
            : variant === "destructive"
              ? withOpacity(colors.destructive, (dark ? 0.2 : 0.1) + (feedback ? 0.1 : 0))
              : feedback
                ? withOpacity(colors.muted, dark ? 0.5 : 1)
                : "transparent"
  const shadow = useShadowTransition([
    {
      offsetX: 0,
      offsetY: 0,
      spreadDistance: focused && !disabled ? 3 : 0,
      color: withOpacity(colors.ring, focused && !disabled ? 0.5 : 0),
    },
  ])
  const box: StyleProp<ViewStyle> = [
    {
      maxWidth: "100%",
      minWidth: 0,
      alignSelf: align === "end" ? "flex-end" : "flex-start",
      overflow: "hidden",
      borderRadius: variant === "ghost" ? 0 : radius.xl,
      borderWidth: 1,
      borderColor: focused && !disabled ? colors.ring : variant === "outline" ? colors.border : "transparent",
      paddingHorizontal: variant === "ghost" ? 0 : 12,
      paddingVertical: variant === "ghost" ? 0 : 8,
      backgroundColor,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ]
  const content = messageText(children, [
    { ...typography.regular, fontSize: 14, lineHeight: 22.75, color, flexShrink: 1 },
    textStyle,
  ])
  if (!interactive)
    return (
      <View {...props} accessibilityState={accessibilityState} style={box}>
        {content}
      </View>
    )
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={(event) => {
        setActive(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setActive(false)
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
      style={[transition(["backgroundColor", "borderColor"]), box, shadow]}
    >
      {content}
    </AnimatedPressable>
  )
}
export type BubbleReactionsProps = ViewProps & {
  align?: "start" | "end"
  side?: "top" | "bottom"
  /** Removes padding when reactions contain buttons, matching web's button treatment. */
  interactive?: boolean
  textStyle?: StyleProp<TextStyle>
}
function Reactions({
  align = "end",
  side = "bottom",
  interactive = false,
  style,
  textStyle,
  onLayout,
  children,
  ...props
}: BubbleReactionsProps) {
  const { colors, typography } = useNativeTheme()
  const [height, setHeight] = useState(24)
  return (
    <View
      {...props}
      onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height)
        onLayout?.(event)
      }}
      style={[
        {
          position: "absolute",
          zIndex: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          borderRadius: 9999,
          backgroundColor: colors.muted,
          paddingHorizontal: interactive ? 0 : 6,
          paddingVertical: interactive ? 0 : 2,
          boxShadow: `0 0 0 3px ${colors.card}`,
          [side]: 0,
          [align === "start" ? "start" : "end"]: 12,
          transform: [{ translateY: height * (side === "top" ? -0.75 : 0.75) }],
        },
        style,
      ]}
    >
      {messageText(children, [
        { ...typography.regular, color: colors.foreground, fontSize: 14, lineHeight: 20 },
        textStyle,
      ])}
    </View>
  )
}
export const Bubble = { Root, Group, Content, Reactions }
