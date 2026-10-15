/** Composable activity timeline with inline details, solid connectors, and shared relative-time formatting. */
import "@formatjs/intl-pluralrules/polyfill.js"
import "@formatjs/intl-pluralrules/locale-data/en.js"
import "@formatjs/intl-relativetimeformat/polyfill.js"
import "@formatjs/intl-relativetimeformat/locale-data/en.js"
import {
  Children,
  cloneElement,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { I18nManager, Platform, Text, View, type StyleProp, type TextStyle } from "react-native"
import { formatRelativeTime } from "../../lib/time"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { AnimatedView, useMotion } from "../../lib/motion"
import { isFocusVisible } from "../../lib/focus"
import { Button, type ButtonProps } from "./button"
import { Empty as NativeEmpty, type EmptyRootProps } from "./empty"

const Direction = createContext(false)
const Position = createContext({ last: true, gap: 20 })
type ViewProps = ComponentPropsWithRef<typeof View>
type TextProps = ComponentPropsWithRef<typeof Text>
export type ActivityFeedRootProps = ViewProps & { busy?: boolean; dir?: "ltr" | "rtl" }
function Root({ busy = false, dir, style, accessibilityState, ...props }: ActivityFeedRootProps) {
  return (
    <Direction.Provider value={dir ? dir === "rtl" : I18nManager.isRTL}>
      <View
        role="feed"
        {...props}
        accessibilityState={{ ...accessibilityState, busy }}
        style={[{ width: "100%", gap: 24 }, style]}
      />
    </Direction.Provider>
  )
}
export type ActivityFeedGroupProps = ViewProps
function Group({ style, ...props }: ActivityFeedGroupProps) {
  return <View {...props} style={[{ gap: 12 }, style]} />
}
export type ActivityFeedGroupLabelProps = TextProps
function GroupLabel({ style, ...props }: ActivityFeedGroupLabelProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      accessibilityRole="header"
      {...props}
      style={[
        {
          ...typography.medium,
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          color: colors.mutedForeground,
        },
        style,
      ]}
    />
  )
}
function entries(children: ReactNode, prefix = ""): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child]
    const key = `${prefix}${child.key}`
    return child.type === Fragment ? entries(child.props.children, `${key}/`) : [cloneElement(child, { key })]
  })
}
export type ActivityFeedItemsProps = ViewProps & {
  /** Space between events; also extends the connector. */ gap?: number
}
function Items({ gap = 20, children, style, ...props }: ActivityFeedItemsProps) {
  const items = entries(children)
  return (
    <View role="list" {...props} style={[{ gap }, style]}>
      {items.map((child, index) => (
        <Position.Provider
          key={isValidElement(child) ? (child.key ?? index) : index}
          value={{ last: index === items.length - 1, gap }}
        >
          {child}
        </Position.Provider>
      ))}
    </View>
  )
}
export type ActivityFeedItemProps = ViewProps & {
  value: string
  /** Override for a custom wrapper rendering several items. */ last?: boolean
}
function Item({ value, last, children, style, onFocus, onBlur, ...props }: ActivityFeedItemProps) {
  const position = useContext(Position)
  const rtl = useContext(Direction)
  const { colors, radius } = useNativeTheme()
  const { reduced, easing } = useMotion()
  const [focused, setFocused] = useState(false)
  return (
    <AnimatedView
      role="article"
      nativeID={`activity-${value}`}
      tabIndex={Platform.OS === "web" ? 0 : undefined}
      {...props}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        {
          position: "relative",
          flexDirection: rtl ? "row-reverse" : "row",
          gap: 12,
          borderWidth: 1,
          borderColor: focused ? colors.ring : "transparent",
          borderRadius: radius.lg,
          boxShadow: focused
            ? [{ offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: 3, color: withOpacity(colors.ring, 0.5) }]
            : [],
          transitionProperty: ["borderColor"],
          transitionDuration: reduced ? 0 : 100,
          transitionTimingFunction: easing,
        },
        style,
      ]}
    >
      {!(last ?? position.last) && (
        <View
          testID="activity-feed-connector"
          accessible={false}
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 16,
            bottom: -(position.gap + 16),
            width: 1,
            [rtl ? "right" : "left"]: 15.5,
            backgroundColor: colors.border,
          }}
        />
      )}
      {children}
    </AnimatedView>
  )
}
export type ActivityFeedItemMarkerProps = ViewProps
function ItemMarker({ children, style, ...props }: ActivityFeedItemMarkerProps) {
  const { colors, radius } = useNativeTheme()
  const hasContent = Children.toArray(children).length > 0
  return (
    <View
      accessible={false}
      {...props}
      style={[
        {
          zIndex: 1,
          width: 32,
          height: 32,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.full,
          backgroundColor: hasContent ? colors.muted : colors.background,
          borderWidth: hasContent ? 1 : 0,
          borderColor: colors.border,
          boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: 4, color: colors.background }],
        },
        style,
      ]}
    >
      {hasContent ? (
        children
      ) : (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: radius.full,
            backgroundColor: withOpacity(colors.mutedForeground, 0.6),
          }}
        />
      )}
    </View>
  )
}
export type ActivityFeedItemContentProps = ViewProps
function ItemContent({ style, ...props }: ActivityFeedItemContentProps) {
  return <View {...props} style={[{ flex: 1, minWidth: 0, gap: 6, paddingTop: 6 }, style]} />
}
export type ActivityFeedItemHeaderProps = ViewProps & { textStyle?: StyleProp<TextStyle> }
function ItemHeader({ children, style, textStyle, ...props }: ActivityFeedItemHeaderProps) {
  const { colors, typography } = useNativeTheme()
  const rtl = useContext(Direction)
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: rtl ? "row-reverse" : "row",
          flexWrap: "wrap",
          alignItems: "baseline",
          columnGap: 6,
          rowGap: 2,
        },
        style,
      ]}
    >
      {Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text
            style={[
              { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, flexShrink: 1 },
              textStyle,
            ]}
          >
            {child}
          </Text>
        ) : (
          child
        )
      )}
    </View>
  )
}
export type ActivityFeedItemActorProps = TextProps
function ItemActor({ style, ...props }: ActivityFeedItemActorProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.medium, fontSize: 14, lineHeight: 19.25, color: colors.foreground }, style]}
    />
  )
}
export type ActivityFeedItemTimeProps = TextProps & { date: Date; now?: Date; locale?: string }
function ItemTime({ date, now, locale, children, style, ...props }: ActivityFeedItemTimeProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      accessibilityHint={date.toLocaleString(locale)}
      {...props}
      style={[
        { ...typography.regular, fontSize: 12, lineHeight: 16, color: withOpacity(colors.mutedForeground, 0.8) },
        style,
      ]}
    >
      {children ?? formatRelativeTime(date, { now, locale })}
    </Text>
  )
}
export type ActivityFeedItemBodyProps = TextProps
function ItemBody({ style, ...props }: ActivityFeedItemBodyProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.regular, fontSize: 14, lineHeight: 21, color: colors.mutedForeground }, style]}
    />
  )
}
export type ActivityFeedItemActionsProps = ViewProps
function ItemActions({ style, ...props }: ActivityFeedItemActionsProps) {
  const rtl = useContext(Direction)
  return (
    <View {...props} style={[{ flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 4 }, style]} />
  )
}
export type ActivityFeedLoadMoreTriggerProps = ButtonProps
function LoadMoreTrigger({ children, style, ...props }: ActivityFeedLoadMoreTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      style={(state) => [{ alignSelf: "center" }, typeof style === "function" ? style(state) : style]}
    >
      {children ?? "Load older activity"}
    </Button>
  )
}
export type ActivityFeedEmptyProps = EmptyRootProps
function Empty(props: ActivityFeedEmptyProps) {
  return <NativeEmpty.Root {...props} />
}
export const ActivityFeed = {
  Root,
  Group,
  GroupLabel,
  Items,
  Item,
  ItemMarker,
  ItemContent,
  ItemHeader,
  ItemActor,
  ItemTime,
  ItemBody,
  ItemActions,
  LoadMoreTrigger,
  Empty,
}
