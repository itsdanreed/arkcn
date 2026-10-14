import { AnimatedView, useMotion } from "../../lib/motion"
import { isFocusVisible } from "../../lib/focus"
import { useState, type ComponentPropsWithRef } from "react"
import { View } from "react-native"
import { Button, type ButtonProps } from "./button"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { usePanelPresence } from "../../lib/presence"
import { useNativeTheme, withOpacity } from "../../lib/theme"

/** Content tabs with selected-state styling, horizontal/vertical layouts, and optional panel preservation. */
export type TabsRootProps = ComponentPropsWithRef<typeof View> & {
  value?: string
  /** Initial selected tab; provide this or a controlled value. */
  defaultValue?: string
  onValueChange?: (details: { value: string }) => void
  orientation?: "horizontal" | "vertical"
  lazyMount?: boolean
  unmountOnExit?: boolean
}
const [Provider, useTabs] = createRequiredContext<{
  value: string
  setValue: (value: string) => void
  orientation: "horizontal" | "vertical"
  lazyMount: boolean
  unmountOnExit: boolean
}>("Tabs")
const [ListProvider, useList] = createRequiredContext<"default" | "line">("Tabs.List")
function TabsRoot({
  value,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  lazyMount = true,
  unmountOnExit = true,
  style,
  ...props
}: TabsRootProps) {
  const [selected, setValue] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  const { spacing } = useNativeTheme()
  return (
    <Provider value={{ value: selected, setValue, orientation, lazyMount, unmountOnExit }}>
      <View
        {...props}
        style={[{ flexDirection: orientation === "horizontal" ? "column" : "row", gap: spacing.sm }, style]}
      />
    </Provider>
  )
}
export type TabsListProps = ComponentPropsWithRef<typeof View> & { variant?: "default" | "line" }
function TabsList({ variant = "default", style, ...props }: TabsListProps) {
  const { orientation } = useTabs()
  const { colors, tabs, radius, spacing } = useNativeTheme()
  return (
    <ListProvider value={variant}>
      <View
        accessibilityRole="tablist"
        {...props}
        style={[
          {
            flexDirection: orientation === "horizontal" ? "row" : "column",
            alignSelf: "flex-start",
            flexWrap: "wrap",
            maxWidth: "100%",
            padding: tabs.padding,
            ...(orientation === "horizontal" ? { height: 32 } : {}),
            alignItems: "center",
            gap: variant === "line" ? spacing.xs : 0,
            borderRadius: variant === "line" ? 0 : radius.lg,
            backgroundColor: variant === "line" ? "transparent" : colors.muted,
          },
          style,
        ]}
      />
    </ListProvider>
  )
}
export type TabsTriggerProps = Omit<ButtonProps, "variant" | "size"> & { value: string }
function TabsTrigger({
  value,
  children,
  style,
  textStyle,
  disabled,
  onPress,
  onFocus,
  onBlur,
  accessibilityState,
  ...props
}: TabsTriggerProps) {
  const { value: selected, setValue, orientation } = useTabs()
  const variant = useList()
  const { transition } = useMotion()
  const active = selected === value
  const [focused, setFocused] = useState(false)
  const { colors, colorScheme, tabs, spacing, radius } = useNativeTheme()
  return (
    <Button
      variant="ghost"
      backgroundClip="border-box"
      accessibilityRole="tab"
      {...props}
      disabled={disabled}
      aria-selected={active}
      accessibilityState={{ ...accessibilityState, selected: active }}
      onPress={(event) => {
        if (disabled) return
        onPress?.(event)
        if (!event.defaultPrevented) setValue(value)
      }}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={(state) => [
        {
          minHeight: tabs.triggerHeight,
          height: tabs.triggerHeight,
          transform: [{ translateY: 0 }],
          paddingHorizontal: spacing.buttonGap,
          paddingVertical: spacing.half,
          borderRadius: radius.md,
          backgroundColor:
            variant === "default" && active
              ? colorScheme === "dark"
                ? withOpacity(colors.input, 0.3)
                : colors.background
              : "transparent",
          borderColor: focused
            ? colors.ring
            : variant === "default" && active && colorScheme === "dark"
              ? colors.input
              : "transparent",
          boxShadow: focused
            ? [{ offsetX: 0, offsetY: 0, spreadDistance: 3, color: withOpacity(colors.ring, 0.5) }]
            : active && variant === "default"
              ? [
                  { offsetX: 0, offsetY: 1, blurRadius: 3, color: "rgba(0, 0, 0, 0.1)" },
                  { offsetX: 0, offsetY: 1, blurRadius: 2, spreadDistance: -1, color: "rgba(0, 0, 0, 0.1)" },
                ]
              : [],
        },
        typeof style === "function" ? style(state) : style,
      ]}
      textStyle={[
        {
          color: active
            ? colors.foreground
            : colorScheme === "dark"
              ? colors.mutedForeground
              : withOpacity(colors.foreground, 0.6),
        },
        textStyle,
      ]}
    >
      {(state) => [
        typeof children === "function" ? children(state) : children,
        variant === "line" && (
          <AnimatedView
            key="line"
            pointerEvents="none"
            style={[
              transition(["opacity"]),
              { position: "absolute", backgroundColor: colors.foreground, opacity: active ? 1 : 0 },
              orientation === "horizontal"
                ? { bottom: -6, left: -1, right: -1, height: tabs.lineWidth }
                : { right: -5, top: -1, bottom: -1, width: tabs.lineWidth },
            ]}
          />
        ),
      ]}
    </Button>
  )
}
export type TabsContentProps = ComponentPropsWithRef<typeof View> & { value: string }
function TabsContent({ value, style, ...props }: TabsContentProps) {
  const tabs = useTabs()
  const active = tabs.value === value
  const mounted = usePanelPresence(active, tabs.lazyMount, tabs.unmountOnExit)
  if (!mounted) return null
  return (
    <View
      {...props}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      style={[{ flexShrink: 1 }, style, !active && { display: "none" }]}
    />
  )
}
export const Tabs = { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Content: TabsContent }
