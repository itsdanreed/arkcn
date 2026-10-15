/** File attachments with native actions, image previews, and upload-state shimmer. */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  useImperativeHandle,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import {
  Image,
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type PressableStateCallbackType,
} from "react-native"
import Animated, {
  useAnimatedRef,
  useScrollOffset,
  useDerivedValue,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated"
import { MaskedView } from "@expo/ui/community/masked-view"
import { AnimatedText, AnimatedView, useMotion, useShadowTransition } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { isFocusVisible } from "../../lib/focus"
import { Button, type ButtonProps } from "./button"

type Size = "default" | "sm" | "xs"
type State = "idle" | "uploading" | "processing" | "error" | "done"
type ViewProps = ComponentPropsWithRef<typeof View>
const Layout = createContext({
  size: "default" as Size,
  state: "done" as State,
  vertical: false,
  active: false,
  setActive: (_active: boolean) => {},
  setFocused: (_focused: boolean) => {},
})
function contains(children: ReactNode, type: unknown): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) && (child.type === type || contains(child.props.children, type))
  )
}
export type AttachmentRootProps = ViewProps & {
  size?: Size
  state?: State
  orientation?: "horizontal" | "vertical"
  /** Supply these when a custom component hides the corresponding part. */
  hasContent?: boolean
  hasMedia?: boolean
}
function Root({
  size = "default",
  state = "done",
  orientation = "horizontal",
  hasContent,
  hasMedia,
  style,
  children,
  ...props
}: AttachmentRootProps) {
  const { colors, radius } = useNativeTheme()
  const { transition } = useMotion()
  const [active, setActive] = useState(false)
  const [focused, setFocused] = useState(false)
  const vertical = orientation === "vertical"
  const content = hasContent ?? contains(children, Content)
  const media = hasMedia ?? contains(children, Media)
  const paddingX = media
    ? size === "xs"
      ? 4
      : size === "sm"
        ? 6
        : 8
    : content
      ? size === "xs"
        ? 6
        : size === "sm"
          ? 8
          : 10
      : 0
  const paddingY = content || media ? (size === "xs" ? 4 : size === "sm" ? 6 : 8) : 0
  const shadow = useShadowTransition([
    { offsetX: 0, offsetY: 0, spreadDistance: focused ? 1 : 0, color: withOpacity(colors.ring, focused ? 0.5 : 0) },
  ])
  return (
    <Layout.Provider value={{ size, state, vertical, active, setActive, setFocused }}>
      <AnimatedView
        {...props}
        style={[
          transition(["backgroundColor", "borderColor"]),
          {
            position: "relative",
            alignSelf: "flex-start",
            maxWidth: "100%",
            minWidth: vertical ? 0 : 160,
            ...(vertical ? { width: content ? 120 : 96 } : {}),
            flexDirection: vertical ? "column" : "row",
            flexWrap: "nowrap",
            flexShrink: 0,
            alignItems: vertical ? "stretch" : "center",
            gap: size === "xs" ? 6 : size === "sm" ? 10 : 8,
            paddingHorizontal: paddingX,
            paddingVertical: paddingY,
            borderWidth: 1,
            borderRadius: size === "xs" ? radius.lg : radius.xl,
            borderStyle: state === "idle" ? "dashed" : "solid",
            borderColor: state === "error" ? withOpacity(colors.destructive, 0.3) : colors.border,
            backgroundColor: active ? withOpacity(colors.muted, 0.5) : colors.card,
          },
          shadow,
          style,
        ]}
      >
        {children}
      </AnimatedView>
    </Layout.Provider>
  )
}
export type AttachmentMediaProps = ViewProps & { variant?: "icon" | "image" }
function Media({ variant = "icon", children, style, ...props }: AttachmentMediaProps) {
  const { size, state, vertical } = useContext(Layout)
  const { colors, radius } = useNativeTheme()
  const dimension = size === "xs" ? 28 : size === "sm" ? 32 : 40
  const color = state === "error" ? colors.destructive : colors.foreground
  return (
    <View
      {...props}
      style={[
        {
          width: vertical ? "100%" : dimension,
          aspectRatio: 1,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: size === "xs" ? radius.md : radius.lg,
          backgroundColor: state === "error" ? withOpacity(colors.destructive, 0.1) : colors.muted,
          opacity: variant === "image" && state !== "done" && state !== "idle" ? 0.6 : 1,
        },
        style,
      ]}
    >
      {Children.map(children, (child) => {
        if (
          !isValidElement<{
            size?: number
            color?: string
            style?: ComponentPropsWithRef<typeof Image>["style"]
            resizeMode?: ComponentPropsWithRef<typeof Image>["resizeMode"]
          }>(child)
        )
          return child
        if (variant === "image" && child.type === Image)
          return cloneElement(child, {
            resizeMode: child.props.resizeMode ?? "cover",
            style: [{ width: "100%", height: "100%" }, child.props.style],
          })
        if (variant === "icon")
          return cloneElement(child, {
            size: child.props.size ?? (size === "xs" ? 14 : vertical ? 24 : 16),
            color: child.props.color ?? color,
          })
        return child
      })}
    </View>
  )
}
export type AttachmentContentProps = ViewProps
function Content({ style, ...props }: AttachmentContentProps) {
  const { vertical } = useContext(Layout)
  return (
    <View
      {...props}
      style={[{ minWidth: 0, maxWidth: "100%", flexShrink: 1, ...(vertical ? { paddingHorizontal: 4 } : {}) }, style]}
    />
  )
}
export type AttachmentTitleProps = ComponentPropsWithRef<typeof Text>
function Title({ style, onLayout, ...props }: AttachmentTitleProps) {
  const { size, state } = useContext(Layout)
  const { colors, colorScheme, typography } = useNativeTheme()
  const { reduced } = useMotion()
  const [width, setWidth] = useState(0)
  const busy = state === "uploading" || state === "processing"
  const textStyle = StyleSheet.flatten([
    {
      ...typography.medium,
      fontSize: size === "default" ? 14 : 12,
      lineHeight: size === "default" ? 17.5 : 15,
      color: colors.cardForeground,
    },
    style,
  ])
  const color = String(textStyle?.color ?? colors.cardForeground)
  const spread = 40 + Number(textStyle?.fontSize ?? 14) * 1.8
  const fullWidth = width * 2 + spread * 2
  const gradient = `linear-gradient(110deg, ${color} calc(50% - ${spread}px), ${colorScheme === "dark" ? "white" : withOpacity(color, 0.2)} 50%, ${color} calc(50% + ${spread}px))`
  const animated = busy && !reduced
  if (Platform.OS === "web")
    return (
      <AnimatedText
        numberOfLines={1}
        {...props}
        onLayout={onLayout}
        style={[
          textStyle,
          animated &&
            ({
              backgroundImage: gradient,
              backgroundSize: `calc(200% + ${spread * 2}px) 100%`,
              backgroundRepeat: "no-repeat",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animationName: { from: { backgroundPosition: "100% 0" }, to: { backgroundPosition: "0 0" } },
              animationDuration: 2000,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDirection: I18nManager.isRTL ? "reverse" : "normal",
            } as unknown as TextStyle),
        ]}
      />
    )
  // The real Text owns layout and accessibility; its duplicate is only an alpha mask.
  return (
    <View style={{ maxWidth: "100%", minWidth: 0 }}>
      <Text
        numberOfLines={1}
        {...props}
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width)
          onLayout?.(event)
        }}
        style={[textStyle, animated && width > 0 && { color: "transparent" }]}
      />
      {animated && width > 0 && (
        <MaskedView
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          maskElement={
            <Text numberOfLines={1} {...props} accessible={false} style={[textStyle, { color: "black", opacity: 1 }]} />
          }
        >
          <AnimatedView
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: fullWidth,
              experimental_backgroundImage: `linear-gradient(110deg, ${color} ${50 - (spread / fullWidth) * 100}%, ${colorScheme === "dark" ? "white" : withOpacity(color, 0.2)} 50%, ${color} ${50 + (spread / fullWidth) * 100}%)`,
              animationName: {
                from: { transform: [{ translateX: -(width + spread * 2) }] },
                to: { transform: [{ translateX: 0 }] },
              },
              animationDuration: 2000,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDirection: I18nManager.isRTL ? "reverse" : "normal",
            }}
          />
        </MaskedView>
      )}
    </View>
  )
}
export type AttachmentDescriptionProps = ComponentPropsWithRef<typeof Text>
function Description({ style, ...props }: AttachmentDescriptionProps) {
  const { colors, typography } = useNativeTheme()
  const { state } = useContext(Layout)
  return (
    <Text
      numberOfLines={1}
      {...props}
      style={[
        {
          ...typography.regular,
          marginTop: 2,
          minWidth: 0,
          maxWidth: "100%",
          fontSize: 12,
          lineHeight: 16,
          color: state === "error" ? withOpacity(colors.destructive, 0.8) : colors.mutedForeground,
        },
        style,
      ]}
    />
  )
}
export type AttachmentActionsProps = ViewProps
function Actions({ style, ...props }: AttachmentActionsProps) {
  const { vertical } = useContext(Layout)
  return (
    <View
      {...props}
      pointerEvents="box-none"
      style={[
        {
          zIndex: 20,
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          ...(vertical ? ({ position: "absolute", top: 12, end: 12, gap: 4 } as const) : { marginStart: "auto" }),
        },
        style,
      ]}
    />
  )
}
export type AttachmentActionTriggerProps = ButtonProps
function ActionTrigger({
  size = "icon-xs",
  variant = "ghost",
  onFocus,
  onBlur,
  children,
  ...props
}: AttachmentActionTriggerProps) {
  const { setFocused } = useContext(Layout)
  const { colors } = useNativeTheme()
  return (
    <Button
      {...props}
      size={size}
      variant={variant}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
    >
      {typeof children === "function"
        ? children
        : Children.map(children, (child) =>
            isValidElement<{ size?: number; color?: string }>(child)
              ? cloneElement(child, {
                  size: child.props.size ?? 14,
                  color:
                    child.props.color ??
                    (variant === "default"
                      ? colors.primaryForeground
                      : variant === "destructive"
                        ? colors.destructive
                        : colors.foreground),
                })
              : child
          )}
    </Button>
  )
}
export type AttachmentTriggerProps = ComponentPropsWithRef<typeof Pressable>
function Trigger({
  style,
  disabled,
  accessibilityState,
  onPress,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  ...props
}: AttachmentTriggerProps) {
  const { setActive, setFocused } = useContext(Layout)
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPress={(event) => {
        if (!disabled) onPress?.(event)
      }}
      onHoverIn={(event) => {
        if (!disabled) setActive(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setActive(false)
        onHoverOut?.(event)
      }}
      onPressIn={(event) => {
        if (!disabled) setActive(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setActive(false)
        onPressOut?.(event)
      }}
      onFocus={(event) => {
        if (!disabled) setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={(state: PressableStateCallbackType) => [
        StyleSheet.absoluteFill,
        { zIndex: 10 },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  )
}
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
function FadeEdge({
  progress,
  width,
  reverse = false,
}: {
  progress: SharedValue<number>
  width: number
  reverse?: boolean
}) {
  const gradientStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }), [progress])
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: width * progress.get() }] }), [progress, width])
  return (
    <View style={{ width, height: "100%", overflow: "hidden", transform: [{ scaleX: reverse ? -1 : 1 }] }}>
      <AnimatedView
        style={[
          {
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            experimental_backgroundImage: "linear-gradient(90deg, transparent, black)",
          },
          gradientStyle,
        ]}
      />
      <AnimatedView style={[{ position: "absolute", inset: 0, backgroundColor: "black" }, fillStyle]} />
    </View>
  )
}
export type AttachmentGroupProps = ComponentPropsWithRef<typeof ScrollView>
function Group({
  contentContainerStyle,
  style,
  children,
  onContentSizeChange,
  onLayout,
  onScroll,
  ref,
  snapToOffsets,
  ...props
}: AttachmentGroupProps) {
  const [heights, setHeights] = useState<Record<string, number>>({})
  const groupStyle = StyleSheet.flatten(contentContainerStyle)
  const paddingTop = Number(groupStyle?.paddingTop ?? groupStyle?.paddingVertical ?? groupStyle?.padding ?? 4)
  const paddingBottom = Number(groupStyle?.paddingBottom ?? groupStyle?.paddingVertical ?? groupStyle?.padding ?? 4)
  const height =
    Math.max(
      0,
      ...Object.entries(heights)
        .filter(([index]) => Number(index) < Children.count(children))
        .map(([, h]) => h)
    ) +
    paddingTop +
    paddingBottom
  const [width, setWidth] = useState(0)
  const [offsets, setOffsets] = useState<Record<string, number>>({})
  const scrollRef = useAnimatedRef<ScrollView>()
  useImperativeHandle(ref, () => scrollRef.current!, [scrollRef])
  const offset = useScrollOffset(scrollRef)
  const viewport = useSharedValue(0)
  const extent = useSharedValue(0)
  const leading = useDerivedValue(() => Math.min(1, Math.max(0, Math.abs(offset.get()) / 96)), [offset])
  const trailing = useDerivedValue(
    () => Math.min(1, Math.max(0, (extent.get() - viewport.get() - Math.abs(offset.get())) / 96)),
    [offset, extent, viewport]
  )
  const edge = Math.min(width * 0.12, 40)
  const mask = (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <FadeEdge progress={leading} width={edge} />
      <View style={{ flex: 1, backgroundColor: "black" }} />
      <FadeEdge progress={trailing} width={edge} reverse />
    </View>
  )
  // Web uses the same mask through CSS; native bridges the mask to SwiftUI/Compose.
  const webMask = useAnimatedStyle(
    () =>
      Platform.OS === "web"
        ? ({
            maskImage: `linear-gradient(90deg, transparent, black ${edge * leading.get()}px, black calc(100% - ${edge * trailing.get()}px), transparent)`,
          } as never)
        : {},
    [edge, leading, trailing]
  )
  const content = (
    <AnimatedScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      {...props}
      snapToOffsets={
        snapToOffsets ??
        Object.entries(offsets)
          .filter(([index]) => Number(index) < Children.count(children))
          .map(([, x]) => x)
          .sort((a, b) => a - b)
      }
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onContentSizeChange={(w, h) => {
        extent.set(w)
        onContentSizeChange?.(w, h)
      }}
      onLayout={(event) => {
        viewport.set(event.nativeEvent.layout.width)
        setWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      style={{ flex: 1 }}
      contentContainerStyle={[
        { flexDirection: "row", gap: 12, paddingVertical: 4, alignItems: "flex-start" },
        contentContainerStyle,
      ]}
    >
      {Children.map(children, (child, index) =>
        isValidElement<ViewProps>(child)
          ? cloneElement(child, {
              onLayout: (event) => {
                const { x, height: childHeight } = event.nativeEvent.layout
                setHeights((current) =>
                  current[index] === childHeight ? current : { ...current, [index]: childHeight }
                )
                setOffsets((current) => (current[index] === x ? current : { ...current, [index]: x }))
                child.props.onLayout?.(event)
              },
            })
          : child
      )}
    </AnimatedScrollView>
  )
  return Platform.OS === "web" ? (
    <AnimatedView style={[{ height, minWidth: 0, flexGrow: 0 }, webMask, style]}>{content}</AnimatedView>
  ) : (
    <MaskedView style={[{ height, minWidth: 0, flexGrow: 0 }, style]} maskElement={mask}>
      {content}
    </MaskedView>
  )
}
export const Attachment = { Root, Group, Media, Content, Title, Description, Actions, ActionTrigger, Trigger }
