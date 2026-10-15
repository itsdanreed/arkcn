/** Star ratings with half-value selection, shared colors, and an adjustable native accessibility control. */
import { useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { I18nManager, Platform, Pressable, Text, View } from "react-native"
import { StarIcon, StarHalfIcon } from "lucide-react-native"
import Svg, { Path } from "react-native-svg"
import Animated, { Easing, useAnimatedProps, withTiming } from "react-native-reanimated"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedText, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { useFieldsetContext } from "./fieldset"

type RatingState = {
  value: number
  hoveredValue: number | null
  count: number
  items: number[]
  allowHalf: boolean
  disabled: boolean
  readOnly: boolean
  dir: "ltr" | "rtl"
  focused: boolean
  label: string
  id: string
  valueText: string
  setLabel: (value: string) => void
  setFocused: (value: boolean) => void
  setHoveredValue: (value: number | null) => void
  setValue: (value: number) => void
  clearValue: () => void
  increment: () => void
  decrement: () => void
}
const [Provider, useRatingGroupContext] = createRequiredContext<RatingState>("RatingGroup")
type ItemState = { index: number; half: boolean; highlighted: boolean; checked: boolean }
const [ItemProvider, useRatingGroupItemContext] = createRequiredContext<ItemState>("RatingGroup.Item")
export { useRatingGroupContext, useRatingGroupItemContext }
export type RatingGroupRootProps = ComponentPropsWithRef<typeof View> & {
  value?: number
  defaultValue?: number
  onValueChange?: (details: { value: number }) => void
  count?: number
  allowHalf?: boolean
  disabled?: boolean
  readOnly?: boolean
  dir?: "ltr" | "rtl"
  /** Localize the value announced by assistive technology. */
  getValueText?: (value: number, count: number) => string
}
function RatingGroupRoot({
  value,
  defaultValue = 0,
  onValueChange,
  count = 5,
  allowHalf = false,
  disabled = false,
  readOnly = false,
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  getValueText = (value, count) => `${value} of ${count} stars`,
  children,
  style,
  ...props
}: RatingGroupRootProps) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("RatingGroup count must be a positive integer")
  const normalize = (n: number) =>
    Math.min(count, Math.max(0, Number.isFinite(n) ? Math.round(n * (allowHalf ? 2 : 1)) / (allowHalf ? 2 : 1) : 0))
  const [selected, update] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  const parent = useFieldsetContext()
  const blocked = disabled || parent.disabled
  const current = normalize(selected)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [label, setLabel] = useState("")
  const id = useId()
  const setValue = (next: number) => {
    if (blocked || readOnly) return
    setHoveredValue(null)
    update(normalize(next))
  }
  return (
    <Provider
      value={{
        value: current,
        hoveredValue: blocked || readOnly ? null : hoveredValue,
        count,
        items: Array.from({ length: count }, (_, index) => index + 1),
        allowHalf,
        disabled: blocked,
        readOnly,
        dir,
        focused,
        label,
        id,
        valueText: getValueText(current, count),
        setLabel,
        setFocused,
        setHoveredValue,
        setValue,
        clearValue: () => setValue(0),
        increment: () => setValue(current + (allowHalf ? 0.5 : 1)),
        decrement: () => setValue(current - (allowHalf ? 0.5 : 1)),
      }}
    >
      <View {...props} style={[{ gap: 6, direction: dir }, style]}>
        {children ?? (
          <RatingGroupControl>
            {Array.from({ length: count }, (_, index) => (
              <RatingGroupItem key={index + 1} index={index + 1} />
            ))}
          </RatingGroupControl>
        )}
      </View>
    </Provider>
  )
}
export type RatingGroupContextProps = { children: (context: RatingState) => ReactNode }
function RatingGroupContext({ children }: RatingGroupContextProps) {
  return children(useRatingGroupContext())
}
export type RatingGroupItemContextProps = { children: (context: ItemState) => ReactNode }
function RatingGroupItemContext({ children }: RatingGroupItemContextProps) {
  return children(useRatingGroupItemContext())
}
export type RatingGroupLabelProps = ComponentPropsWithRef<typeof Text>
function RatingGroupLabel({ children, accessibilityLabel, style, ...props }: RatingGroupLabelProps) {
  const { setLabel, id } = useRatingGroupContext()
  const { colors, typography, fontSize } = useNativeTheme()
  const label =
    accessibilityLabel ?? (typeof children === "string" || typeof children === "number" ? String(children) : "")
  useLayoutEffect(() => {
    setLabel(label)
    return () => setLabel("")
  }, [label, setLabel])
  return (
    <Text
      {...props}
      nativeID={`${id}-label`}
      accessibilityLabel={accessibilityLabel}
      style={[
        { ...typography.medium, fontSize: fontSize.md, lineHeight: fontSize.md, color: colors.foreground },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
export type RatingGroupControlProps = ComponentPropsWithRef<typeof View>
function RatingGroupControl({
  style,
  accessibilityLabel,
  accessibilityHint,
  onAccessibilityAction,
  onFocus,
  onBlur,
  onPointerLeave,
  ...props
}: RatingGroupControlProps) {
  const group = useRatingGroupContext()
  const blocked = group.disabled || group.readOnly
  return (
    <View
      {...props}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel ?? (group.label || "Rating")}
      accessibilityHint={accessibilityHint ?? (group.readOnly ? "Read only" : undefined)}
      accessibilityValue={{ min: 0, max: group.count, now: group.value, text: group.valueText }}
      accessibilityState={{ ...props.accessibilityState, disabled: group.disabled }}
      accessibilityActions={blocked ? [] : [{ name: "increment" }, { name: "decrement" }]}
      {...(Platform.OS === "web" && {
        tabIndex: group.disabled ? -1 : 0,
        "aria-valuemin": 0,
        "aria-valuemax": group.count,
        "aria-valuenow": group.value,
        "aria-valuetext": group.valueText,
        "aria-readonly": group.readOnly,
        onKeyDown: (event: {
          nativeEvent: { key: string }
          preventDefault: () => void
          defaultPrevented?: boolean
        }) => {
          if (blocked || event.defaultPrevented) return
          if (event.nativeEvent.key === "ArrowRight") {
            const adjust = group.dir === "rtl" ? group.decrement : group.increment
            adjust()
          } else if (event.nativeEvent.key === "ArrowLeft") {
            const adjust = group.dir === "rtl" ? group.increment : group.decrement
            adjust()
          } else if (event.nativeEvent.key === "ArrowUp") group.increment()
          else if (event.nativeEvent.key === "ArrowDown") group.decrement()
          else if (event.nativeEvent.key === "Home") group.setValue(0)
          else if (event.nativeEvent.key === "End") group.setValue(group.count)
          else return
          event.preventDefault()
        },
      })}
      onAccessibilityAction={(event) => {
        onAccessibilityAction?.(event)
        if (event.defaultPrevented || blocked) return
        if (event.nativeEvent.actionName === "increment") group.increment()
        if (event.nativeEvent.actionName === "decrement") group.decrement()
      }}
      onFocus={(event) => {
        group.setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        group.setFocused(false)
        group.setHoveredValue(null)
        onBlur?.(event)
      }}
      onPointerLeave={(event) => {
        group.setHoveredValue(null)
        onPointerLeave?.(event)
      }}
      style={[
        { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 2 },
        Platform.OS === "web" && { outlineWidth: 0 },
        style,
      ]}
    />
  )
}

const AnimatedPath = Animated.createAnimatedComponent(Path)
// Lucide star / star-half paths (ISC), shared with the web icons.
const starPath =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
const halfStarPath =
  "M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"
function RatingIcon({ half, highlighted }: { half: boolean; highlighted: boolean }) {
  const { colors } = useNativeTheme()
  const { reduced, motion, transition } = useMotion()
  const color = highlighted ? colors.primary : withOpacity(colors.mutedForeground, 0.4)
  const animatedProps = useAnimatedProps<{ stroke: string; fill: string }>(() => {
    if (Platform.OS === "web") return {}
    const timing = {
      duration: reduced ? 0 : motion.duration,
      easing: Easing.bezier(...motion.easing),
    }
    // Each property needs its own animation instance; Reanimated mutates animation state.
    return { stroke: withTiming(color, timing), fill: highlighted ? withTiming(color, timing) : "transparent" }
  }, [color, highlighted, reduced, motion.duration, motion.easing])
  return Platform.OS === "web" ? (
    <AnimatedText style={[{ color, width: 20, height: 20, lineHeight: 20 }, transition("all")]}>
      {half ? (
        <StarHalfIcon size={20} color="currentColor" fill="currentColor" />
      ) : (
        <StarIcon size={20} color="currentColor" fill={highlighted ? "currentColor" : "none"} />
      )}
    </AnimatedText>
  ) : (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <AnimatedPath
        d={half ? halfStarPath : starPath}
        stroke={color}
        fill={highlighted ? color : "transparent"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  )
}

export type RatingGroupItemProps = ComponentPropsWithRef<typeof Pressable> & { index: number }
function RatingGroupItem({
  index,
  children,
  style,
  onPress,
  onPressIn,
  onPressOut,
  onLayout,
  onPointerMove,
  ...props
}: RatingGroupItemProps) {
  const group = useRatingGroupContext()
  const { colors, radius, minimumTouchTarget } = useNativeTheme()
  const width = useRef(20)
  const [pressed, setPressed] = useState(false)
  const blocked = group.disabled || group.readOnly || !!props.disabled
  const preview = group.hoveredValue ?? group.value
  const half = preview === index - 0.5
  const highlighted = preview >= index || half
  const checked = Math.ceil(group.value) === index
  const focus = group.focused && (checked || (group.value === 0 && index === 1))
  if (!Number.isInteger(index) || index < 1 || index > group.count)
    throw new RangeError("RatingGroup.Item index must be within the group count")
  const pointValue = (x: number | undefined) => {
    if (!group.allowHalf || x === undefined || !Number.isFinite(x)) return index
    const firstHalf = group.dir === "rtl" ? x > width.current / 2 : x < width.current / 2
    return index - (firstHalf ? 0.5 : 0)
  }
  const eventValue = (event: {
    nativeEvent: { locationX?: number; offsetX?: number; clientX?: number }
    currentTarget?: unknown
  }) => {
    // RN Web click events use client coordinates; native touch events use locationX.
    const target = event.currentTarget as { getBoundingClientRect?: () => { left: number; width: number } }
    if (Platform.OS === "web" && typeof event.nativeEvent.clientX === "number" && target?.getBoundingClientRect) {
      const rect = target.getBoundingClientRect()
      width.current = rect.width
      return pointValue(event.nativeEvent.clientX - rect.left)
    }
    return pointValue(event.nativeEvent.locationX ?? event.nativeEvent.offsetX)
  }
  return (
    <ItemProvider value={{ index, half, highlighted, checked }}>
      <Pressable
        {...props}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        focusable={false}
        {...(Platform.OS === "web" && { tabIndex: -1, "aria-hidden": true })}
        disabled={blocked}
        // Vertical expansion avoids overlapping the neighboring half-star targets.
        hitSlop={{ top: (minimumTouchTarget - 20) / 2, bottom: (minimumTouchTarget - 20) / 2, left: 0, right: 0 }}
        onLayout={(event) => {
          width.current = event.nativeEvent.layout.width
          onLayout?.(event)
        }}
        onPressIn={(event) => {
          onPressIn?.(event)
          if (blocked || event.defaultPrevented) return
          setPressed(true)
          group.setHoveredValue(eventValue(event))
        }}
        onPressOut={(event) => {
          setPressed(false)
          group.setHoveredValue(null)
          onPressOut?.(event)
        }}
        onPress={(event) => {
          onPress?.(event)
          if (!blocked && !event.defaultPrevented) group.setValue(eventValue(event))
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event)
          if (blocked || event.defaultPrevented || event.nativeEvent.pointerType === "touch") return
          const next = eventValue(event)
          if (group.hoveredValue !== next) group.setHoveredValue(next)
        }}
        style={(state) => [
          {
            width: 20,
            height: 20,
            borderRadius: radius.sm,
            boxShadow: focus ? `0px 0px 0px 3px ${withOpacity(colors.ring, 0.5)}` : "none",
          },
          Platform.OS === "web" && {
            outlineWidth: 0,
            cursor: blocked ? "auto" : "pointer",
          },
          typeof style === "function" ? style(state) : style,
        ]}
      >
        <View pointerEvents="none">
          {typeof children === "function"
            ? children({ pressed })
            : (children ?? <RatingIcon half={half} highlighted={highlighted} />)}
        </View>
      </Pressable>
    </ItemProvider>
  )
}
export const RatingGroup = {
  Root: RatingGroupRoot,
  Label: RatingGroupLabel,
  Control: RatingGroupControl,
  Item: RatingGroupItem,
  Context: RatingGroupContext,
  ItemContext: RatingGroupItemContext,
}
