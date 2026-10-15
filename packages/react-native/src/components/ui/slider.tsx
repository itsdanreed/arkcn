/** Composable single/range slider with contained thumbs and native adjustable actions. */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { I18nManager, Platform, Text, View, type ViewStyle } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedView, useShadowTransition } from "../../lib/motion"
import { sliderCenter, sliderValueAt, snapSliderValue } from "../../lib/slider"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { useFieldsetContext } from "./fieldset"

type ViewProps = ComponentPropsWithRef<typeof View>
type TextProps = ComponentPropsWithRef<typeof Text>
export type UseSliderProps = {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  minStepsBetweenThumbs?: number
  orientation?: "horizontal" | "vertical"
  origin?: "start" | "center" | "end"
  dir?: "ltr" | "rtl"
  disabled?: boolean
  readOnly?: boolean
  onValueChange?: (details: { value: number[] }) => void
  onValueChangeEnd?: (details: { value: number[] }) => void
  getValueText?: (value: number, index: number) => string
}
export function useSlider({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  orientation = "horizontal",
  origin = "start",
  dir = I18nManager.isRTL ? "rtl" : "ltr",
  disabled = false,
  readOnly = false,
  onValueChange,
  onValueChangeEnd,
  getValueText = String,
}: UseSliderProps = {}) {
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min ||
    !Number.isFinite(step) ||
    step <= 0 ||
    !Number.isInteger(minStepsBetweenThumbs) ||
    minStepsBetweenThumbs < 0
  )
    throw new RangeError(
      "Slider requires finite min < max, a positive step, and nonnegative integer minStepsBetweenThumbs"
    )
  const [raw, update] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  if (!raw.length || raw.some((n) => !Number.isFinite(n)))
    throw new RangeError("Slider value must contain finite numbers")
  const gap = step * minStepsBetweenThumbs
  if (gap * (raw.length - 1) > max - min) throw new RangeError("Slider thumb spacing exceeds the available range")
  const values = raw.map((n) => snapSliderValue(n, min, max, step)).sort((a, b) => a - b)
  for (let i = 0; i < values.length; i++)
    values[i] = Math.min(
      max - gap * (values.length - i - 1),
      Math.max(min + gap * i, values[i], i ? values[i - 1] + gap : min)
    )
  const latest = useRef(values)
  latest.current = values
  const parent = useFieldsetContext()
  const blocked = disabled || parent.disabled
  const [size, setSize] = useState(0)
  const [label, setLabel] = useState("")
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const vertical = orientation === "vertical"
  const reverse = vertical || dir === "rtl"
  const bounds = (index: number) => ({
    min: index > 0 ? latest.current[index - 1] + gap : min,
    max: index < latest.current.length - 1 ? latest.current[index + 1] - gap : max,
  })
  const setThumbValue = (index: number, next: number, commit = false) => {
    if (blocked || readOnly || index < 0 || index >= latest.current.length) return
    const limits = bounds(index)
    const normalized = Math.max(limits.min, Math.min(limits.max, snapSliderValue(next, min, max, step)))
    const changed = normalized !== latest.current[index]
    const result = latest.current.map((n, i) => (i === index ? normalized : n))
    latest.current = result
    if (changed) update(result)
    if (commit) onValueChangeEnd?.({ value: [...result] })
  }
  return {
    value: values,
    min,
    max,
    step,
    orientation,
    vertical,
    origin,
    dir,
    reverse,
    disabled: blocked,
    readOnly,
    size,
    setSize,
    label,
    setLabel,
    draggingIndex,
    setDraggingIndex,
    getValueText,
    bounds,
    setThumbValue,
    getThumbPercent: (index: number) => (values[index] - min) / (max - min),
    center: (n: number) => sliderCenter(n, min, max, size, reverse),
    end: () => {
      if (!blocked && !readOnly) onValueChangeEnd?.({ value: [...latest.current] })
      setDraggingIndex(null)
    },
  }
}
type SliderApi = ReturnType<typeof useSlider>
const [Provider, useSliderContext] = createRequiredContext<SliderApi>("Slider")
export { useSliderContext }
export type SliderRootProviderProps = ViewProps & { value: SliderApi }
function RootProvider({ value, style, ...props }: SliderRootProviderProps) {
  return (
    <Provider value={value}>
      <View
        {...props}
        style={[
          {
            gap: 8,
            opacity: value.disabled ? 0.5 : 1,
            width: value.vertical ? undefined : "100%",
            minHeight: value.vertical ? 160 : undefined,
            direction: value.dir,
          },
          style,
        ]}
      />
    </Provider>
  )
}
export type SliderRootProps = ViewProps & UseSliderProps
function Root({
  value,
  defaultValue,
  min,
  max,
  step,
  minStepsBetweenThumbs,
  orientation,
  origin,
  dir,
  disabled,
  readOnly,
  onValueChange,
  onValueChangeEnd,
  getValueText,
  children,
  ...props
}: SliderRootProps) {
  const api = useSlider({
    value,
    defaultValue,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    orientation,
    origin,
    dir,
    disabled,
    readOnly,
    onValueChange,
    onValueChangeEnd,
    getValueText,
  })
  return (
    <RootProvider value={api} {...props}>
      {children ?? (
        <Control>
          <Track>
            <Range />
          </Track>
          {api.value.map((_, index) => (
            <Thumb key={index} index={index} />
          ))}
        </Control>
      )}
    </RootProvider>
  )
}
export type SliderContextProps = { children: (api: SliderApi) => ReactNode }
function Context({ children }: SliderContextProps) {
  return children(useSliderContext())
}
export type SliderLabelProps = TextProps
function Label({ children, style, ...props }: SliderLabelProps) {
  const { setLabel } = useSliderContext()
  const { colors, typography } = useNativeTheme()
  useLayoutEffect(() => {
    setLabel(typeof children === "string" ? children : "")
  }, [children, setLabel])
  return (
    <Text {...props} style={[{ ...typography.medium, fontSize: 14, lineHeight: 20, color: colors.foreground }, style]}>
      {children}
    </Text>
  )
}
export type SliderValueTextProps = TextProps
function ValueText({ children, style, ...props }: SliderValueTextProps) {
  const api = useSliderContext()
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }, style]}
    >
      {children ?? api.value.map(api.getValueText).join(", ")}
    </Text>
  )
}
export type SliderControlProps = ViewProps
function Control({ style, onLayout, ref, ...props }: SliderControlProps) {
  const api = useSliderContext()
  const latest = useRef(api)
  latest.current = api
  const control = useRef<ComponentRef<typeof View>>(null)
  const gesture = useRef<{ point: number; origin?: number; index?: number; released: boolean } | null>(null)
  useLayoutEffect(
    () => () => {
      gesture.current = null
    },
    []
  )
  const move = () => {
    const drag = gesture.current
    const current = latest.current
    if (!drag || drag.origin === undefined || current.disabled || current.readOnly) return
    const next = sliderValueAt(
      drag.point - drag.origin,
      current.size,
      current.min,
      current.max,
      current.step,
      current.reverse
    )
    if (drag.index === undefined) {
      drag.index = current.value.reduce(
        (nearest, n, index) => (Math.abs(n - next) <= Math.abs(current.value[nearest] - next) ? index : nearest),
        0
      )
      current.setDraggingIndex(drag.index)
    }
    current.setThumbValue(drag.index, next)
    if (drag.released) {
      current.end()
      gesture.current = null
    }
  }
  return (
    <View
      {...props}
      ref={(node) => {
        control.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      hitSlop={20}
      onLayout={(event) => {
        api.setSize(api.vertical ? event.nativeEvent.layout.height : event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      onStartShouldSetResponder={() => !api.disabled && !api.readOnly}
      onMoveShouldSetResponder={() => !api.disabled && !api.readOnly}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => {
        const drag = { point: api.vertical ? event.nativeEvent.pageY : event.nativeEvent.pageX, released: false }
        gesture.current = drag
        control.current?.measure((_x, _y, _w, _h, x, y) => {
          if (gesture.current !== drag) return
          gesture.current.origin = latest.current.vertical ? y : x
          move()
        })
      }}
      onResponderMove={(event) => {
        if (gesture.current) {
          gesture.current.point = api.vertical ? event.nativeEvent.pageY : event.nativeEvent.pageX
          move()
        }
      }}
      onResponderRelease={() => {
        if (gesture.current) {
          gesture.current.released = true
          move()
        }
      }}
      onResponderTerminate={() => {
        gesture.current = null
        api.setDraggingIndex(null)
      }}
      style={[
        {
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          height: api.vertical ? undefined : 4,
          width: api.vertical ? 4 : "100%",
          flexGrow: api.vertical ? 1 : 0,
          flexBasis: api.vertical ? 0 : undefined,
          flexShrink: api.vertical ? 1 : 0,
          minHeight: api.vertical ? 160 : undefined,
        },
        Platform.OS === "web" && ({ touchAction: "none", userSelect: "none" } as ViewStyle),
        style,
      ]}
    />
  )
}
export type SliderTrackProps = ViewProps
function Track({ style, ...props }: SliderTrackProps) {
  const { vertical } = useSliderContext()
  const { colors, radius } = useNativeTheme()
  return (
    <View
      pointerEvents="none"
      {...props}
      style={[
        {
          position: "relative",
          overflow: "hidden",
          borderRadius: radius.full,
          backgroundColor: colors.muted,
          width: vertical ? 4 : "100%",
          height: vertical ? undefined : 4,
          ...(vertical && { position: "absolute", top: 0, bottom: 0 }),
        },
        style,
      ]}
    />
  )
}
export type SliderRangeProps = ViewProps
function Range({ style, ...props }: SliderRangeProps) {
  const api = useSliderContext()
  const { colors } = useNativeTheme()
  const positions = api.value.map(api.center)
  if (positions.length === 1)
    positions.push(api.origin === "center" ? api.size / 2 : (api.origin === "end") !== api.reverse ? api.size : 0)
  const start = Math.min(...positions)
  const length = Math.max(...positions) - start
  return (
    <View
      pointerEvents="none"
      {...props}
      style={[
        { position: "absolute", backgroundColor: colors.primary },
        api.vertical ? { top: start, height: length, width: "100%" } : { left: start, width: length, height: "100%" },
        style,
      ]}
    />
  )
}
const ThumbIndex = createContext(0)
export type SliderThumbProps = ViewProps & { index: number }
function Thumb({
  index,
  style,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onAccessibilityAction,
  accessibilityLabel,
  children,
  ...props
}: SliderThumbProps) {
  const api = useSliderContext()
  const { colors, radius } = useNativeTheme()
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const blocked = api.disabled || api.readOnly
  const active = !api.disabled && (focused || hovered || api.draggingIndex === index)
  const shadow = useShadowTransition([
    {
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadDistance: active ? 3 : 0,
      color: withOpacity(colors.ring, active ? 0.5 : 0),
    },
  ])
  if (index < 0 || index >= api.value.length || !Number.isInteger(index))
    throw new RangeError("Slider.Thumb index is outside the value array")
  const limits = api.bounds(index)
  return (
    <ThumbIndex.Provider value={index}>
      <AnimatedView
        {...props}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={
          accessibilityLabel ?? `${api.label || "Value"}${api.value.length > 1 ? ` ${index + 1}` : ""}`
        }
        accessibilityValue={{
          min: limits.min,
          max: limits.max,
          now: api.value[index],
          text: api.getValueText(api.value[index], index),
        }}
        accessibilityState={{ ...props.accessibilityState, disabled: api.disabled }}
        accessibilityHint={api.readOnly ? "Read only" : props.accessibilityHint}
        accessibilityActions={blocked ? [] : [{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          onAccessibilityAction?.(event)
          if (event.defaultPrevented || blocked) return
          const action = event.nativeEvent.actionName
          if (action === "increment" || action === "decrement")
            api.setThumbValue(index, api.value[index] + (action === "increment" ? api.step : -api.step), true)
        }}
        {...(Platform.OS === "web" && {
          tabIndex: api.disabled ? -1 : 0,
          "aria-orientation": api.orientation,
          "aria-readonly": api.readOnly,
          onKeyDown: (event: { nativeEvent: { key: string }; preventDefault: () => void }) => {
            if (blocked) return
            const key = event.nativeEvent.key
            const delta =
              key === "ArrowUp" ||
              (key === "ArrowRight" && api.dir !== "rtl") ||
              (key === "ArrowLeft" && api.dir === "rtl")
                ? api.step
                : key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight"
                  ? -api.step
                  : key === "PageUp"
                    ? api.step * 10
                    : key === "PageDown"
                      ? -api.step * 10
                      : 0
            if (!delta && key !== "Home" && key !== "End") return
            event.preventDefault()
            api.setThumbValue(
              index,
              key === "Home" ? limits.min : key === "End" ? limits.max : api.value[index] + delta,
              true
            )
          },
        })}
        onFocus={(event) => {
          setFocused(isFocusVisible(event))
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        onPointerEnter={(event) => {
          if (event.nativeEvent.pointerType !== "touch") setHovered(true)
          onPointerEnter?.(event)
        }}
        onPointerLeave={(event) => {
          setHovered(false)
          onPointerLeave?.(event)
        }}
        style={[
          {
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.ring,
            backgroundColor: "#ffffff",
            zIndex: active ? 2 : 1,
          },
          api.vertical
            ? { top: api.center(api.value[index]) - 6, left: -4 }
            : { left: api.center(api.value[index]) - 6, top: -4 },
          shadow,
          Platform.OS === "web" && { outlineWidth: 0 },
          style,
        ]}
      >
        {children}
      </AnimatedView>
    </ThumbIndex.Provider>
  )
}
export type SliderDraggingIndicatorProps = TextProps
function DraggingIndicator({ children, style, ...props }: SliderDraggingIndicatorProps) {
  const api = useSliderContext()
  const index = useContext(ThumbIndex)
  const { colors, typography, radius } = useNativeTheme()
  if (api.draggingIndex !== index) return null
  return (
    <Text
      pointerEvents="none"
      {...props}
      style={[
        {
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          ...typography.medium,
          fontSize: 12,
          lineHeight: 16,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: radius.md,
          backgroundColor: colors.primary,
          color: colors.primaryForeground,
          minWidth: 28,
          textAlign: "center",
        },
        style,
      ]}
    >
      {children ?? api.getValueText(api.value[index], index)}
    </Text>
  )
}
export type SliderMarkerGroupProps = ViewProps
function MarkerGroup({ style, ...props }: SliderMarkerGroupProps) {
  return <View {...props} style={[{ position: "relative", height: 16 }, style]} />
}
export type SliderMarkerProps = TextProps & { value: number }
function Marker({ value, style, onLayout, ...props }: SliderMarkerProps) {
  const api = useSliderContext()
  const { colors, typography } = useNativeTheme()
  const [width, setWidth] = useState(0)
  return (
    <Text
      {...props}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      style={[
        {
          position: "absolute",
          left: api.center(value) - width / 2,
          ...typography.regular,
          color: colors.mutedForeground,
          fontSize: 12,
          lineHeight: 16,
        },
        style,
      ]}
    />
  )
}
export const Slider = {
  Root,
  RootProvider,
  Context,
  Label,
  ValueText,
  Control,
  Track,
  Range,
  Thumb,
  DraggingIndicator,
  MarkerGroup,
  Marker,
}
