/** Native scrolling with arkcn's slim, draggable, theme-aware scrollbar. */
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { I18nManager, ScrollView, View } from "react-native"
import { useNativeTheme } from "../../lib/theme"
import { useMotion } from "../../lib/motion"
import { scrollGeometry } from "../../lib/scroll-area"

type ViewProps = ComponentPropsWithRef<typeof View>
type Axis = "vertical" | "horizontal"
type Size = { width: number; height: number }
type Point = { x: number; y: number }
export type UseScrollAreaProps = { orientation?: Axis | "both"; disabled?: boolean }
export function useScrollArea({ orientation = "vertical", disabled = false }: UseScrollAreaProps = {}) {
  const { reduced } = useMotion()
  const ref = useRef<ComponentRef<typeof ScrollView>>(null)
  const horizontalRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const [viewportSize, setViewportSize] = useState<Size>({ width: 0, height: 0 })
  const [contentSize, setContentSize] = useState<Size>({ width: 0, height: 0 })
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 })
  const horizontal = orientation === "horizontal"
  const both = orientation === "both"
  const overflowX = orientation !== "vertical" && viewportSize.width > 0 && contentSize.width > viewportSize.width
  const overflowY = orientation !== "horizontal" && viewportSize.height > 0 && contentSize.height > viewportSize.height
  const corner = overflowX && overflowY ? 10 : 0
  const axes = {
    horizontal: {
      viewport: viewportSize.width,
      content: contentSize.width,
      offset: position.x,
      ...scrollGeometry(viewportSize.width, contentSize.width, position.x, corner),
      overflow: overflowX,
    },
    vertical: {
      viewport: viewportSize.height,
      content: contentSize.height,
      offset: position.y,
      ...scrollGeometry(viewportSize.height, contentSize.height, position.y, corner),
      overflow: overflowY,
    },
  }
  const scrollTo = (target: number | Partial<Point>, animated = false) => {
    if (disabled) return
    const point = typeof target === "number" ? (horizontal ? { x: target } : { y: target }) : target
    const x = Math.max(0, Math.min(axes.horizontal.maxOffset, point.x ?? position.x))
    const y = Math.max(0, Math.min(axes.vertical.maxOffset, point.y ?? position.y))
    const motion = animated && !reduced
    if (both) {
      if (point.y !== undefined) ref.current?.scrollTo({ x: 0, y, animated: motion })
      if (point.x !== undefined) horizontalRef.current?.scrollTo({ x, y: 0, animated: motion })
    } else ref.current?.scrollTo({ x: horizontal ? x : 0, y: horizontal ? 0 : y, animated: motion })
  }
  return {
    ref,
    horizontalRef,
    orientation,
    horizontal,
    both,
    disabled,
    viewportSize,
    contentSize,
    position,
    setViewportSize,
    setContentSize,
    setPosition,
    axes,
    corner,
    scrollTo,
    ...axes[horizontal ? "horizontal" : "vertical"],
  }
}
type ScrollAreaApi = ReturnType<typeof useScrollArea>
const AreaContext = createContext<ScrollAreaApi | null>(null)
export function useScrollAreaContext() {
  const value = useContext(AreaContext)
  if (!value) throw new Error("ScrollArea parts must be inside ScrollArea.Root or RootProvider")
  return value
}
export type ScrollAreaRootProviderProps = ViewProps & { value: ScrollAreaApi }
function RootProvider({ value, style, ...props }: ScrollAreaRootProviderProps) {
  return (
    <AreaContext.Provider value={value}>
      <View {...props} style={[{ position: "relative", overflow: "hidden" }, style]} />
    </AreaContext.Provider>
  )
}
export type ScrollAreaRootProps = ViewProps &
  UseScrollAreaProps & {
    /** Compose Viewport, Content, and Scrollbar yourself. */
    composed?: boolean
    viewportProps?: ScrollAreaViewportProps
  }
function Root({ orientation, disabled, composed = false, viewportProps, children, ...props }: ScrollAreaRootProps) {
  const api = useScrollArea({ orientation, disabled })
  return (
    <RootProvider value={api} {...props}>
      {composed ? (
        children
      ) : (
        <>
          <Viewport {...viewportProps}>
            <Content>{children}</Content>
          </Viewport>
          <Scrollbar orientation={api.horizontal ? "horizontal" : "vertical"} />
          {api.both && <Scrollbar orientation="horizontal" />}
          <Corner />
        </>
      )}
    </RootProvider>
  )
}
export type ScrollAreaViewportProps = ComponentPropsWithRef<typeof ScrollView> & {
  /** Props for the inner horizontal ScrollView in two-axis mode. */
  horizontalViewportProps?: Omit<ComponentPropsWithRef<typeof ScrollView>, "children" | "horizontal">
}
function Viewport({
  ref,
  style,
  children,
  onLayout,
  onContentSizeChange,
  onScroll,
  scrollEnabled,
  horizontalViewportProps,
  ...props
}: ScrollAreaViewportProps) {
  const api = useScrollAreaContext()
  const { colorScheme } = useNativeTheme()
  const common = {
    nestedScrollEnabled: true,
    bounces: false,
    contentInsetAdjustmentBehavior: "never" as const,
    keyboardShouldPersistTaps: "handled" as const,
    indicatorStyle: colorScheme === "dark" ? ("white" as const) : ("black" as const),
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 16,
  }
  return (
    <ScrollView
      {...common}
      {...props}
      ref={(node) => {
        api.ref.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      horizontal={api.horizontal}
      scrollEnabled={!api.disabled && scrollEnabled !== false}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout
        api.setViewportSize({ width, height })
        onLayout?.(event)
      }}
      onContentSizeChange={(width, height) => {
        // The inner viewport measures the intrinsic width in two-axis mode.
        if (!api.both) {
          api.setContentSize({ width, height })
          onContentSizeChange?.(width, height)
        }
      }}
      onScroll={(event) => {
        const { x, y } = event.nativeEvent.contentOffset
        api.setPosition((current) => (api.both ? { ...current, y } : { x, y }))
        onScroll?.(event)
      }}
      style={[{ flex: 1, minHeight: 0, minWidth: 0 }, style]}
    >
      {api.both ? (
        <ScrollView
          {...common}
          {...horizontalViewportProps}
          horizontal
          ref={(node) => {
            api.horizontalRef.current = node
            const innerRef = horizontalViewportProps?.ref
            if (typeof innerRef === "function") return innerRef(node)
            if (innerRef) innerRef.current = node
          }}
          scrollEnabled={!api.disabled && scrollEnabled !== false && horizontalViewportProps?.scrollEnabled !== false}
          onContentSizeChange={(width, height) => {
            api.setContentSize({ width, height })
            onContentSizeChange?.(width, height)
            horizontalViewportProps?.onContentSizeChange?.(width, height)
          }}
          onScroll={(event) => {
            const x = event.nativeEvent.contentOffset.x
            api.setPosition((current) => ({ ...current, x }))
            horizontalViewportProps?.onScroll?.(event)
          }}
          style={[{ flexGrow: 0, flexShrink: 0, width: "100%" }, horizontalViewportProps?.style]}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </ScrollView>
  )
}
export type ScrollAreaContentProps = ViewProps
function Content({ style, ...props }: ScrollAreaContentProps) {
  const { orientation } = useScrollAreaContext()
  return <View {...props} style={[orientation === "vertical" && { width: "100%" }, style]} />
}
export type ScrollAreaScrollbarProps = ViewProps & { orientation?: Axis }
const BarOrientation = createContext<Axis | null>(null)
function Scrollbar({ style, children, ref, orientation, ...props }: ScrollAreaScrollbarProps) {
  const area = useScrollAreaContext()
  const axis = orientation ?? (area.horizontal ? "horizontal" : "vertical")
  const api = {
    ...area.axes[axis],
    disabled: area.disabled,
    horizontal: axis === "horizontal",
    scrollTo: (value: number) => area.scrollTo(axis === "horizontal" ? { x: value } : { y: value }),
  }
  const trackRef = useRef<ComponentRef<typeof View>>(null)
  const start = useRef({ pointer: 0, offset: 0 })
  if (!api.overflow) return null
  const horizontal = api.horizontal
  return (
    <BarOrientation.Provider value={axis}>
      <View
        ref={(node) => {
          trackRef.current = node
          if (typeof ref === "function") return ref(node)
          if (ref) ref.current = node
        }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${horizontal ? "Horizontal" : "Vertical"} scroll position`}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(Math.max(0, Math.min(1, api.offset / api.maxOffset)) * 100),
        }}
        accessibilityState={{ disabled: api.disabled }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          const direction = event.nativeEvent.actionName === "increment" ? 1 : -1
          api.scrollTo(api.offset + direction * api.viewport * 0.8)
        }}
        {...props}
        onStartShouldSetResponder={() => !api.disabled}
        onMoveShouldSetResponder={() => !api.disabled}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(event) => {
          const pointer = horizontal ? event.nativeEvent.pageX : event.nativeEvent.pageY
          // measure supplies viewport-relative coordinates even when the thumb was touched.
          trackRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
            const position = pointer - (horizontal ? pageX : pageY) - 1
            const inThumb = position >= api.thumbOffset && position <= api.thumbOffset + api.thumbSize
            const offset = inThumb
              ? api.offset
              : ((position - api.thumbSize / 2) / Math.max(1, api.travel)) * api.maxOffset
            start.current = { pointer, offset: Math.max(0, Math.min(api.maxOffset, offset)) }
            if (!inThumb) api.scrollTo(start.current.offset)
          })
        }}
        onResponderMove={(event) => {
          const pointer = horizontal ? event.nativeEvent.pageX : event.nativeEvent.pageY
          api.scrollTo(
            start.current.offset + ((pointer - start.current.pointer) / Math.max(1, api.travel)) * api.maxOffset
          )
        }}
        style={[
          {
            position: "absolute",
            padding: 1,
            ...(horizontal
              ? {
                  left: I18nManager.isRTL ? area.corner : 0,
                  right: I18nManager.isRTL ? 0 : area.corner,
                  bottom: 0,
                  height: 10,
                  borderTopWidth: 1,
                }
              : {
                  top: 0,
                  bottom: area.corner,
                  [I18nManager.isRTL ? "left" : "right"]: 0,
                  width: 10,
                  borderStartWidth: 1,
                }),
            borderColor: "transparent",
          },
          style,
        ]}
      >
        {children ?? <Thumb />}
      </View>
    </BarOrientation.Provider>
  )
}
export type ScrollAreaThumbProps = ViewProps & { orientation?: Axis }
function Thumb({ style, orientation, ...props }: ScrollAreaThumbProps) {
  const area = useScrollAreaContext()
  const inherited = useContext(BarOrientation)
  const axis = orientation ?? inherited ?? (area.horizontal ? "horizontal" : "vertical")
  const api = { ...area.axes[axis], horizontal: axis === "horizontal" }
  const { colors, radius } = useNativeTheme()
  return (
    <View
      pointerEvents="none"
      accessible={false}
      {...props}
      style={[
        {
          backgroundColor: colors.border,
          borderRadius: radius.full,
          ...(api.horizontal
            ? { height: 7, width: api.thumbSize, transform: [{ translateX: api.thumbOffset }] }
            : { width: 7, height: api.thumbSize, transform: [{ translateY: api.thumbOffset }] }),
        },
        style,
      ]}
    />
  )
}
export type ScrollAreaCornerProps = ViewProps
function Corner({ style, ...props }: ScrollAreaCornerProps) {
  const { corner } = useScrollAreaContext()
  if (!corner) return null
  return (
    <View
      pointerEvents="none"
      accessible={false}
      {...props}
      style={[
        { position: "absolute", bottom: 0, [I18nManager.isRTL ? "left" : "right"]: 0, width: corner, height: corner },
        style,
      ]}
    />
  )
}
export type ScrollAreaContextProps = { children: (api: ScrollAreaApi) => ReactNode }
function Context({ children }: ScrollAreaContextProps) {
  return children(useScrollAreaContext())
}
export const ScrollArea = { Root, RootProvider, Viewport, Content, Scrollbar, Thumb, Corner, Context }
