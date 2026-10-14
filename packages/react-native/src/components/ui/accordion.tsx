/** Composable disclosure items with a measured 200ms ease-out height animation. */
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { Text, View } from "react-native"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native"
import { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"

export type UseAccordionProps = {
  /** Controlled expanded item values. */
  value?: string[]
  /** Initial uncontrolled expanded values. */
  defaultValue?: string[]
  /** Receives the next expanded values. */
  onValueChange?: (details: { value: string[] }) => void
  /** Allows more than one expanded item. */
  multiple?: boolean
  /** Allows closing the only expanded item in single mode. */
  collapsible?: boolean
  /** Disables every trigger. */
  disabled?: boolean
  /** Defers mounting content until first expanded. */
  lazyMount?: boolean
  /** Unmounts content after the closing animation. */
  unmountOnExit?: boolean
}
export function useAccordion({
  value,
  defaultValue = [],
  onValueChange,
  multiple = false,
  collapsible = false,
  disabled = false,
  lazyMount = true,
  unmountOnExit = true,
}: UseAccordionProps = {}) {
  const [expanded, setValue] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  return {
    value: expanded,
    setValue,
    multiple,
    collapsible,
    disabled,
    lazyMount,
    unmountOnExit,
    toggleValue(item: string) {
      if (disabled) return
      if (expanded.includes(item)) {
        if (multiple || collapsible) setValue(expanded.filter((value) => value !== item))
      } else setValue(multiple ? [...expanded, item] : [item])
    },
  }
}
export type UseAccordionReturn = ReturnType<typeof useAccordion>
const [Provider, useAccordionContext] = createRequiredContext<UseAccordionReturn>("Accordion")
const [ItemProvider, useAccordionItemContext] = createRequiredContext<{
  value: string
  expanded: boolean
  disabled: boolean
  triggerId: string
  contentId: string
}>("Accordion.Item")
const LastContext = createContext(true)
export { useAccordionContext, useAccordionItemContext }
export type AccordionRootProviderProps = ComponentPropsWithRef<typeof View> & {
  /** State created by useAccordion. */
  value: UseAccordionReturn
}
function AccordionRootProvider({ value, children, style, ...props }: AccordionRootProviderProps) {
  const items = Children.toArray(children)
  return (
    <Provider value={value}>
      <View {...props} style={[{ width: "100%", flexDirection: "column" }, style]}>
        {items.map((child, index) => (
          <LastContext.Provider
            key={typeof child === "object" && "key" in child ? child.key : index}
            value={index === items.length - 1}
          >
            {child}
          </LastContext.Provider>
        ))}
      </View>
    </Provider>
  )
}
export type AccordionRootProps = ComponentPropsWithRef<typeof View> & UseAccordionProps
function AccordionRoot({
  value,
  defaultValue,
  onValueChange,
  multiple,
  collapsible,
  disabled,
  lazyMount,
  unmountOnExit,
  ...props
}: AccordionRootProps) {
  const state = useAccordion({
    value,
    defaultValue,
    onValueChange,
    multiple,
    collapsible,
    disabled,
    lazyMount,
    unmountOnExit,
  })
  return <AccordionRootProvider {...props} value={state} />
}
export type AccordionItemProps = ComponentPropsWithRef<typeof View> & {
  /** Unique value for this item. */
  value: string
  /** Disables this item's trigger. */
  disabled?: boolean
}
function AccordionItem({ value, disabled, style, ...props }: AccordionItemProps) {
  const state = useAccordionContext()
  const last = useContext(LastContext)
  const id = useId()
  const { colors } = useNativeTheme()
  return (
    <ItemProvider
      value={{
        value,
        disabled: !!(disabled || state.disabled),
        expanded: state.value.includes(value),
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
      }}
    >
      <View {...props} style={[{ borderBottomWidth: last ? 0 : 1, borderColor: colors.border }, style]} />
    </ItemProvider>
  )
}
export type AccordionItemTriggerProps = ButtonProps
function AccordionItemTrigger({
  children,
  disabled,
  onPress,
  onHoverIn,
  onHoverOut,
  accessibilityState,
  style,
  textStyle,
  ...props
}: AccordionItemTriggerProps) {
  const state = useAccordionContext()
  const item = useAccordionItemContext()
  const { colors } = useNativeTheme()
  const [hovered, setHovered] = useState(false)
  const blocked = !!(disabled || item.disabled)
  const Icon = item.expanded ? ChevronUpIcon : ChevronDownIcon
  return (
    <Button
      variant="ghost"
      {...props}
      nativeID={item.triggerId}
      aria-controls={item.contentId}
      aria-expanded={item.expanded}
      accessibilityState={{ ...accessibilityState, expanded: item.expanded }}
      disabled={blocked}
      onHoverIn={(event) => {
        setHovered(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        onHoverOut?.(event)
      }}
      onPress={(event) => {
        if (blocked) return
        onPress?.(event)
        if (!event.defaultPrevented) state.toggleValue(item.value)
      }}
      style={(pressState) => [
        {
          width: "100%",
          minHeight: 42,
          paddingHorizontal: 0,
          paddingVertical: 10,
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          transform: [{ translateY: 0 }],
        },
        typeof style === "function" ? style(pressState) : style,
      ]}
      textStyle={[{ flexShrink: 1, textDecorationLine: hovered ? "underline" : "none" }, textStyle]}
    >
      {typeof children === "function"
        ? (pressState) => [
            ...Children.toArray(children(pressState)),
            <Icon key="indicator" size={16} color={colors.mutedForeground} />,
          ]
        : [...Children.toArray(children), <Icon key="indicator" size={16} color={colors.mutedForeground} />]}
    </Button>
  )
}
export type AccordionItemContentProps = ComponentPropsWithRef<typeof View>
function AccordionItemContent({ children, style, onLayout, ...props }: AccordionItemContentProps) {
  const { lazyMount, unmountOnExit } = useAccordionContext()
  const { expanded, contentId, triggerId } = useAccordionItemContext()
  const { colors, typography } = useNativeTheme()
  const { reduced } = useMotion()
  const [present, setPresent] = useState(expanded || !lazyMount)
  const [height, setHeight] = useState(0)
  const duration = reduced ? 0 : 200
  useEffect(() => {
    if (expanded || !unmountOnExit) {
      if (expanded || !lazyMount) setPresent(true)
      return
    }
    if (!duration) {
      setPresent(false)
      return
    }
    const timer = setTimeout(() => setPresent(false), duration)
    return () => clearTimeout(timer)
  }, [expanded, unmountOnExit, lazyMount, duration])
  const animated = useAnimatedStyle(
    () => ({ height: withTiming(expanded ? height : 0, { duration, easing: Easing.bezier(0, 0, 0.58, 1) }) }),
    [expanded, height, duration]
  )
  if (!expanded && !present) return null
  return (
    <AnimatedView
      {...props}
      nativeID={contentId}
      aria-labelledby={triggerId}
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      pointerEvents={expanded ? "auto" : "none"}
      style={[{ overflow: "hidden" }, animated]}
    >
      <View
        onLayout={(event) => {
          setHeight(event.nativeEvent.layout.height)
          onLayout?.(event)
        }}
        style={[{ position: "absolute", top: 0, width: "100%", paddingBottom: 10 }, style]}
      >
        {Children.map(children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }}>
              {child}
            </Text>
          ) : (
            child
          )
        )}
      </View>
    </AnimatedView>
  )
}
export type AccordionItemIndicatorProps = ComponentPropsWithRef<typeof View>
function AccordionItemIndicator({ children, style, ...props }: AccordionItemIndicatorProps) {
  const { expanded } = useAccordionItemContext()
  const { transition } = useMotion()
  return (
    <AnimatedView
      accessible={false}
      {...props}
      style={[
        transition(["transform"]),
        {
          width: 16,
          height: 16,
          marginLeft: "auto",
          flexShrink: 0,
          transform: [{ rotate: expanded ? "180deg" : "0deg" }],
        },
        style,
      ]}
    >
      {children}
    </AnimatedView>
  )
}
export type AccordionContextProps = {
  /** Receives the accordion state. */ children: (state: UseAccordionReturn) => ReactNode
}
function AccordionContext({ children }: AccordionContextProps) {
  return children(useAccordionContext())
}
export type AccordionItemContextProps = {
  /** Receives this item's state. */ children: (state: ReturnType<typeof useAccordionItemContext>) => ReactNode
}
function AccordionItemContext({ children }: AccordionItemContextProps) {
  return children(useAccordionItemContext())
}

export const Accordion = {
  Root: AccordionRoot,
  RootProvider: AccordionRootProvider,
  Context: AccordionContext,
  Item: AccordionItem,
  ItemContext: AccordionItemContext,
  ItemTrigger: AccordionItemTrigger,
  ItemContent: AccordionItemContent,
  ItemIndicator: AccordionItemIndicator,
}
