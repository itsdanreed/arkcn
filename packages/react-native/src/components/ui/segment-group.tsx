import { Children, useCallback, useEffect, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import {
  I18nManager,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutRectangle,
  type StyleProp,
  type TextStyle,
} from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, AnimatedText, AnimatedView, useMotion, useShadowTransition } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { useFieldsetContext } from "./fieldset"

export type UseSegmentGroupProps = {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (details: { value: string | null }) => void
  disabled?: boolean
  readOnly?: boolean
  orientation?: "horizontal" | "vertical"
  dir?: "ltr" | "rtl"
}
export function useSegmentGroup({
  value,
  defaultValue = null,
  onValueChange,
  disabled = false,
  readOnly = false,
  orientation = "horizontal",
  dir = I18nManager.isRTL ? "rtl" : "ltr",
}: UseSegmentGroupProps = {}) {
  const fieldset = useFieldsetContext()
  const [selected, updateValue] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  const blocked = disabled || fieldset.disabled
  return {
    value: selected,
    disabled: blocked,
    readOnly,
    orientation,
    dir,
    setValue(value: string | null) {
      if (!blocked && !readOnly) updateValue(value)
    },
    clearValue() {
      if (!blocked && !readOnly) updateValue(null)
    },
  }
}
export type UseSegmentGroupReturn = ReturnType<typeof useSegmentGroup>
const [Provider, useSegmentGroupContext] = createRequiredContext<UseSegmentGroupReturn>("SegmentGroup")
const [LayoutProvider, useLayouts] = createRequiredContext<{
  layouts: Map<string, LayoutRectangle>
  setLayout: (value: string, layout: LayoutRectangle | null) => void
}>("SegmentGroup")
const [ItemProvider, useSegmentGroupItemContext] = createRequiredContext<{
  value: string
  checked: boolean
  disabled: boolean
  focused: boolean
  highlighted: boolean
}>("SegmentGroup.Item")
export { useSegmentGroupContext, useSegmentGroupItemContext }
export type SegmentGroupRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UseSegmentGroupReturn }
function SegmentGroupRootProvider({ value, style, ...props }: SegmentGroupRootProviderProps) {
  const { colors, tabs, radius } = useNativeTheme()
  const [layouts, setLayouts] = useState(() => new Map<string, LayoutRectangle>())
  const setLayout = useCallback((key: string, rect: LayoutRectangle | null) => {
    setLayouts((previous) => {
      const old = previous.get(key)
      if (
        rect
          ? old && old.x === rect.x && old.y === rect.y && old.width === rect.width && old.height === rect.height
          : !old
      )
        return previous
      const next = new Map(previous)
      if (rect) next.set(key, rect)
      else next.delete(key)
      return next
    })
  }, [])
  const vertical = value.orientation === "vertical"
  return (
    <Provider value={value}>
      <LayoutProvider value={{ layouts, setLayout }}>
        <View
          accessibilityRole="radiogroup"
          {...props}
          style={[
            {
              position: "relative",
              alignSelf: "flex-start",
              flexDirection: vertical ? "column" : value.dir === "rtl" ? "row-reverse" : "row",
              alignItems: vertical ? "stretch" : "center",
              justifyContent: "center",
              padding: tabs.padding,
              minHeight: 32,
              borderRadius: radius.lg,
              backgroundColor: colors.muted,
            },
            style,
          ]}
        />
      </LayoutProvider>
    </Provider>
  )
}
export type SegmentGroupRootProps = ComponentPropsWithRef<typeof View> & UseSegmentGroupProps
function SegmentGroupRoot({
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
  orientation,
  dir,
  ...props
}: SegmentGroupRootProps) {
  const state = useSegmentGroup({ value, defaultValue, onValueChange, disabled, readOnly, orientation, dir })
  return <SegmentGroupRootProvider {...props} value={state} />
}
export type SegmentGroupContextProps = { children: (value: UseSegmentGroupReturn) => ReactNode }
function SegmentGroupContext({ children }: SegmentGroupContextProps) {
  return children(useSegmentGroupContext())
}
export type SegmentGroupItemContextProps = {
  children: (value: ReturnType<typeof useSegmentGroupItemContext>) => ReactNode
}
function SegmentGroupItemContext({ children }: SegmentGroupItemContextProps) {
  return children(useSegmentGroupItemContext())
}
export type SegmentGroupIndicatorProps = ComponentPropsWithRef<typeof View>
function SegmentGroupIndicator({ style, ...props }: SegmentGroupIndicatorProps) {
  const { value } = useSegmentGroupContext()
  const { layouts } = useLayouts()
  const { transition } = useMotion()
  const { colors, colorScheme, radius } = useNativeTheme()
  const rect = value === null ? undefined : layouts.get(value)
  // Mount at the first measured position; never fly in from the origin.
  if (!rect || rect.width <= 0 || rect.height <= 0) return null
  return (
    <AnimatedView
      {...props}
      pointerEvents="none"
      accessible={false}
      style={[
        transition(["transform", "width", "height", "backgroundColor", "borderColor"]),
        {
          position: "absolute",
          top: 0,
          left: 0,
          transform: [{ translateX: rect.x }, { translateY: rect.y }],
          width: rect.width,
          height: rect.height,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colorScheme === "dark" ? colors.input : "transparent",
          backgroundColor: colorScheme === "dark" ? withOpacity(colors.input, 0.3) : colors.background,
          boxShadow: [
            { offsetX: 0, offsetY: 1, blurRadius: 3, color: "rgba(0, 0, 0, 0.1)" },
            { offsetX: 0, offsetY: 1, blurRadius: 2, spreadDistance: -1, color: "rgba(0, 0, 0, 0.1)" },
          ],
        },
        style,
      ]}
    />
  )
}
export type SegmentGroupItemProps = ComponentPropsWithRef<typeof Pressable> & {
  value: string
  textStyle?: StyleProp<TextStyle>
}
function SegmentGroupItem({
  value,
  disabled,
  style,
  textStyle,
  children,
  onLayout,
  onPress,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  accessibilityState,
  ...props
}: SegmentGroupItemProps) {
  const group = useSegmentGroupContext()
  const { setLayout } = useLayouts()
  const { colors, radius, tabs } = useNativeTheme()
  const { transition } = useMotion()
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const blocked = !!(disabled || group.disabled)
  const checked = group.value === value
  const vertical = group.orientation === "vertical"
  const { fontScale } = useWindowDimensions()
  const resolvedStyle = StyleSheet.flatten(typeof style === "function" ? style({ pressed }) : style)
  const shadow = useShadowTransition(
    resolvedStyle?.boxShadow ?? [
      { offsetX: 0, offsetY: 0, spreadDistance: focused ? 3 : 0, color: withOpacity(colors.ring, focused ? 0.5 : 0) },
    ]
  )
  useEffect(() => () => setLayout(value, null), [value, setLayout])
  return (
    <ItemProvider value={{ value, checked, disabled: blocked, focused, highlighted: hovered || pressed }}>
      <AnimatedPressable
        accessible
        accessibilityRole="radio"
        hitSlop={vertical ? { left: 6, right: 6 } : { top: 9, bottom: 9 }}
        {...props}
        disabled={blocked || group.readOnly}
        aria-checked={checked}
        aria-disabled={blocked}
        accessibilityState={{ ...accessibilityState, checked, disabled: blocked }}
        onLayout={(event) => {
          setLayout(value, event.nativeEvent.layout)
          onLayout?.(event)
        }}
        onPress={(event) => {
          if (blocked || group.readOnly) return
          onPress?.(event)
          if (!event.defaultPrevented) group.setValue(value)
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
        style={[
          transition(["borderColor", "opacity"]),
          {
            minHeight: tabs.triggerHeight,
            height: vertical ? undefined : tabs.triggerHeight * Math.max(1, fontScale),
            flexGrow: 0,
            flexBasis: "auto",
            paddingHorizontal: 6,
            paddingVertical: 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: vertical ? "flex-start" : "center",
            gap: 6,
            borderWidth: 1,
            borderColor: focused ? colors.ring : "transparent",
            borderRadius: radius.md,
            zIndex: 1,
            opacity: blocked ? 0.5 : 1,
          },
          resolvedStyle,
          shadow,
        ]}
      >
        {(state) =>
          Children.map(typeof children === "function" ? children(state) : children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <SegmentGroupItemText style={textStyle}>{child}</SegmentGroupItemText>
            ) : (
              child
            )
          )
        }
      </AnimatedPressable>
    </ItemProvider>
  )
}
export type SegmentGroupItemTextProps = ComponentPropsWithRef<typeof Text>
function SegmentGroupItemText({ style, ...props }: SegmentGroupItemTextProps) {
  const item = useSegmentGroupItemContext()
  const { colors, colorScheme, typography } = useNativeTheme()
  const { transition } = useMotion()
  return (
    <AnimatedText
      {...props}
      style={[
        transition("all"),
        {
          ...typography.medium,
          fontSize: 14,
          lineHeight: 20,
          color:
            item.checked || item.highlighted
              ? colors.foreground
              : colorScheme === "dark"
                ? colors.mutedForeground
                : withOpacity(colors.foreground, 0.6),
        },
        style,
      ]}
    />
  )
}
export type SegmentGroupLabelProps = ComponentPropsWithRef<typeof Text>
function SegmentGroupLabel({ style, ...props }: SegmentGroupLabelProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.medium, color: colors.mutedForeground, fontSize: 14, lineHeight: 14 }, style]}
    />
  )
}
export const SegmentGroup = {
  Root: SegmentGroupRoot,
  RootProvider: SegmentGroupRootProvider,
  Context: SegmentGroupContext,
  Indicator: SegmentGroupIndicator,
  Item: SegmentGroupItem,
  ItemText: SegmentGroupItemText,
  ItemContext: SegmentGroupItemContext,
  Label: SegmentGroupLabel,
}
