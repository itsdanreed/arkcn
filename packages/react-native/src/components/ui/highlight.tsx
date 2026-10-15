import { useMemo, useState, type ComponentPropsWithRef } from "react"
import {
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
} from "react-native"
import { getHighlightSegments, type HighlightLine } from "../../lib/highlight-layout"
import { highlightWord, type HighlightWordProps } from "@zag-js/highlight-word"
import { useNativeTheme, withOpacity } from "../../lib/theme"

export type UseHighlightProps = HighlightWordProps
/** Uses the same literal matching and word-boundary rules as the web renderer. */
export function useHighlight({ text, query, ignoreCase, matchAll, exactMatch }: UseHighlightProps) {
  return useMemo(
    () => highlightWord({ text, query, ignoreCase, matchAll, exactMatch }),
    [text, query, ignoreCase, matchAll, exactMatch]
  )
}
export type HighlightRootProps = Omit<ComponentPropsWithRef<typeof Text>, "children"> &
  UseHighlightProps & {
    /** Applied to matching spans only. `style` controls the surrounding text. */
    highlightStyle?: StyleProp<Pick<TextStyle, "backgroundColor" | "color" | "borderRadius">>
  }
function HighlightRoot({
  text,
  query,
  ignoreCase,
  matchAll,
  exactMatch,
  style,
  highlightStyle,
  onTextLayout,
  ...props
}: HighlightRootProps) {
  const chunks = useHighlight({ text, query, ignoreCase, matchAll, exactMatch })
  const { colors, typography, radius } = useNativeTheme()
  const textStyle: TextStyle =
    StyleSheet.flatten([{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }, style]) ?? {}
  const markStyle: TextStyle =
    StyleSheet.flatten([
      { borderRadius: radius.sm, backgroundColor: withOpacity(colors.primary, 0.15), color: colors.foreground },
      highlightStyle,
    ]) ?? {}
  const { fontScale } = useWindowDimensions()
  const layoutKey = text
  const measurementKey = JSON.stringify([
    text,
    textStyle.fontFamily,
    textStyle.fontSize,
    textStyle.fontWeight,
    textStyle.fontStyle,
    textStyle.fontVariant,
    textStyle.letterSpacing,
    textStyle.textTransform,
    fontScale,
    props.numberOfLines,
    props.allowFontScaling,
    props.maxFontSizeMultiplier,
  ])
  const [layout, setLayout] = useState<{ key: string; lines: HighlightLine[] }>({ key: "", lines: [] })
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const content = chunks.map((chunk, index) =>
    chunk.match ? (
      <Text key={index} style={Platform.OS === "web" ? markStyle : { color: markStyle.color }}>
        {chunk.text}
      </Text>
    ) : (
      chunk.text
    )
  )
  if (Platform.OS === "web")
    return (
      <Text {...props} onTextLayout={onTextLayout} style={textStyle}>
        {content}
      </Text>
    )
  const segments = getHighlightSegments(chunks, layout.key === layoutKey ? layout.lines : [])
  return (
    <View style={{ position: "relative" }}>
      {segments.map(({ key, ...segment }) => (
        <HighlightBackground
          key={`${measurementKey}:${key}`}
          {...segment}
          origin={origin}
          textStyle={textStyle}
          markStyle={markStyle}
          allowFontScaling={props.allowFontScaling}
          maxFontSizeMultiplier={props.maxFontSizeMultiplier}
        />
      ))}
      <Text
        {...props}
        style={textStyle}
        onLayout={(event) => {
          const { x, y } = event.nativeEvent.layout
          setOrigin((previous) => (previous.x === x && previous.y === y ? previous : { x, y }))
          props.onLayout?.(event)
        }}
        onTextLayout={(event) => {
          const lines = event.nativeEvent.lines
          setLayout((previous) =>
            previous.key === layoutKey && JSON.stringify(previous.lines) === JSON.stringify(lines)
              ? previous
              : { key: layoutKey, lines }
          )
          onTextLayout?.(event)
        }}
      >
        {content}
      </Text>
    </View>
  )
}

// Native attributed text ignores borderRadius. Paint measured rectangles behind
// the unchanged Text so wrapping, selection, and accessibility remain native.
function HighlightBackground({
  line,
  before,
  through,
  origin,
  textStyle,
  markStyle,
  allowFontScaling,
  maxFontSizeMultiplier,
}: ReturnType<typeof getHighlightSegments>[number] & {
  origin: { x: number; y: number }
  textStyle: TextStyle
  markStyle: TextStyle
  allowFontScaling?: boolean
  maxFontSizeMultiplier?: number | null
}) {
  const [widths, setWidths] = useState<{ before?: number; through?: number }>({})
  const rtl = textStyle.writingDirection === "rtl" || (textStyle.writingDirection !== "ltr" && I18nManager.isRTL)
  const start = before ? widths.before : 0
  const end = widths.through
  const measureStyle: TextStyle = {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize,
    fontWeight: textStyle.fontWeight,
    fontStyle: textStyle.fontStyle,
    fontVariant: textStyle.fontVariant,
    letterSpacing: textStyle.letterSpacing,
    textTransform: textStyle.textTransform,
    includeFontPadding: false,
  }
  const height = line.ascender + line.descender
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {start !== undefined && end !== undefined && end > start && (
        <View
          style={{
            position: "absolute",
            left: origin.x + line.x + (rtl ? line.width - end : start),
            top: origin.y + line.y + (line.height - height) / 2,
            width: end - start,
            height,
            backgroundColor: markStyle.backgroundColor,
            borderRadius: markStyle.borderRadius,
          }}
        />
      )}
      {(["before", "through"] as const).map((part) => {
        const value = part === "before" ? before : through
        if (!value) return null
        return (
          <Text
            key={part}
            allowFontScaling={allowFontScaling}
            maxFontSizeMultiplier={maxFontSizeMultiplier ?? undefined}
            style={[measureStyle, { position: "absolute", width: 100000, opacity: 0 }]}
            onTextLayout={(event) => {
              const width = event.nativeEvent.lines[0]?.width ?? 0
              setWidths((previous) => (previous[part] === width ? previous : { ...previous, [part]: width }))
            }}
          >
            {value}
          </Text>
        )
      })}
    </View>
  )
}
export const Highlight = { Root: HighlightRoot }
