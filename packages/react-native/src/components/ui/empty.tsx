import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithRef,
} from "react"
import { Platform, StyleSheet, Text, View, useWindowDimensions, type TextStyle } from "react-native"
import { useNativeTheme } from "../../lib/theme"

export type EmptyRootProps = ComponentPropsWithRef<typeof View>
function EmptyRoot({ style, ...props }: EmptyRootProps) {
  const { colors, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: "100%",
          minWidth: 0,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          borderRadius: radius.xl,
          borderStyle: "dashed",
          borderColor: colors.border,
        },
        style,
      ]}
    />
  )
}
const HeaderWidth = createContext(0)

export type EmptyHeaderProps = ComponentPropsWithRef<typeof View>
function EmptyHeader({ style, onLayout, children, ...props }: EmptyHeaderProps) {
  const [width, setWidth] = useState(0)
  return (
    <View
      {...props}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      style={[{ maxWidth: 384, width: "100%", alignItems: "center", gap: 8 }, style]}
    >
      <HeaderWidth.Provider value={width}>{children}</HeaderWidth.Provider>
    </View>
  )
}
export type EmptyMediaProps = ComponentPropsWithRef<typeof View> & { variant?: "default" | "icon" }
function EmptyMedia({ variant = "default", children, style, ...props }: EmptyMediaProps) {
  const { colors, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        { marginBottom: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
        variant === "icon" && { width: 32, height: 32, borderRadius: radius.lg, backgroundColor: colors.muted },
        style,
      ]}
    >
      {variant === "icon"
        ? Children.map(children, (child) =>
            isValidElement<{ size?: number; color?: string }>(child)
              ? cloneElement(child, { size: child.props.size ?? 16, color: child.props.color ?? colors.foreground })
              : child
          )
        : children}
    </View>
  )
}
export type EmptyTitleProps = ComponentPropsWithRef<typeof Text>
function EmptyTitle({ style, ...props }: EmptyTitleProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      accessibilityRole="header"
      {...props}
      style={[
        {
          ...typography.medium,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: -0.35,
          textAlign: "center",
          color: colors.foreground,
        },
        style,
      ]}
    />
  )
}
export type EmptyDescriptionProps = ComponentPropsWithRef<typeof Text>
type Balance = { key: string; width: number; low: number; high: number; lines: number; step: number; done: boolean }
function EmptyDescription({ style, children, onTextLayout, ...props }: EmptyDescriptionProps) {
  const { colors, typography } = useNativeTheme()
  const availableWidth = useContext(HeaderWidth)
  const { fontScale } = useWindowDimensions()
  const customStyle = StyleSheet.flatten(style)
  // iOS has no CSS text-wrap: balance. Find the narrowest width that preserves
  // the original line count. Only short, plain descriptions use this bounded
  // search; explicit sizing and rich content retain the caller's native layout.
  const balance =
    Platform.OS !== "web" &&
    availableWidth > 0 &&
    typeof children === "string" &&
    !children.includes("\n") &&
    customStyle?.width == null &&
    customStyle?.maxWidth == null &&
    !props.numberOfLines
  const key = JSON.stringify([
    typeof children === "string" ? children : null,
    availableWidth,
    fontScale,
    typography.regular,
    customStyle,
    props.allowFontScaling,
    props.maxFontSizeMultiplier,
  ])
  const [measurement, setMeasurement] = useState<Balance | null>(null)
  const current = measurement?.key === key ? measurement : null
  const width = current?.width ?? availableWidth
  return (
    <Text
      // Recreate the layout emitter when the header width becomes known: RN
      // suppresses identical line measurements from the earlier intrinsic pass.
      key={balance ? key : undefined}
      textBreakStrategy="simple"
      {...props}
      onTextLayout={(event) => {
        onTextLayout?.(event)
        if (!balance || current?.done) return
        const lineCount = event.nativeEvent.lines.length
        if (!lineCount) return
        setMeasurement((previous) => {
          // Ignore an event from a width/text that has already been replaced.
          if (previous?.key === key && previous.width !== width) return previous
          const target = current?.lines ?? lineCount
          if (target === 1 || target > 6)
            return { key, width: availableWidth, low: 0, high: availableWidth, lines: target, step: 0, done: true }
          const low = lineCount > target ? width : (current?.low ?? 0)
          const high = lineCount > target ? (current?.high ?? availableWidth) : width
          const step = (current?.step ?? 0) + 1
          const done = high - low <= 0.5 || step >= 11
          // Leave one point for differences between native glyph measurement
          // and Yoga pixel rounding at an exact word-wrap boundary.
          return {
            key,
            width: done ? Math.min(availableWidth, high + 1) : (low + high) / 2,
            low,
            high,
            lines: target,
            step,
            done,
          }
        })
      }}
      style={[
        { ...typography.regular, fontSize: 14, lineHeight: 22.75, textAlign: "center", color: colors.mutedForeground },
        Platform.OS === "web" && ({ textWrap: "balance" } as TextStyle),
        balance && { width },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
export type EmptyContentProps = ComponentPropsWithRef<typeof View>
function EmptyContent({ style, ...props }: EmptyContentProps) {
  return (
    <View {...props} style={[{ width: "100%", maxWidth: 384, minWidth: 0, alignItems: "center", gap: 10 }, style]} />
  )
}
export const Empty = {
  Root: EmptyRoot,
  Header: EmptyHeader,
  Media: EmptyMedia,
  Title: EmptyTitle,
  Description: EmptyDescription,
  Content: EmptyContent,
}
