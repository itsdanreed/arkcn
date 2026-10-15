/** Native tables with shared column sizing and the audited web table styling. */
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { ScrollView, Text, View, type StyleProp, type TextStyle } from "react-native"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"

type ViewProps = ComponentPropsWithRef<typeof View>
type CellProps = ViewProps & {
  colSpan?: number
  align?: "start" | "center" | "end"
  textStyle?: StyleProp<TextStyle>
  checkbox?: boolean
}
const Layout = createContext<readonly number[]>([])
const Section = createContext({ footer: false })
const Position = createContext({ column: 0, last: false })
function parts(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? parts(child.props.children) : [child]
  )
}
function plain(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? plain(child.props.children)
          : ""
    )
    .join("")
}
function measurements(
  children: ReactNode,
  footer = false,
  prefix = ""
): { key: string; column: number; span: number; text: string; medium: boolean; style?: StyleProp<TextStyle> }[] {
  return parts(children).flatMap((child, index) => {
    if (!isValidElement<CellProps>(child)) return []
    const key = `${prefix}/${child.key ?? index}`
    if (child.type === Row) {
      let column = 0
      return parts(child.props.children).flatMap((cell, i) => {
        if (!isValidElement<CellProps>(cell)) return []
        const span = Math.max(1, cell.props.colSpan ?? 1)
        const item = {
          key: `${key}/${cell.key ?? i}`,
          column,
          span,
          text: plain(cell.props.children),
          medium: footer || cell.type === Head,
          style: cell.props.textStyle,
        }
        column += span
        return [item]
      })
    }
    if (child.type === Caption) return []
    return measurements(child.props.children, footer || child.type === Footer, key)
  })
}
export type TableRootProps = ViewProps & {
  /** Fixed logical-pixel widths, useful for custom cell content. Otherwise text is measured across all rows. */
  columnWidths?: readonly number[]
  /** Minimum table width; narrow viewports scroll horizontally. */
  minWidth?: number
  scrollViewProps?: Omit<ComponentPropsWithRef<typeof ScrollView>, "children" | "horizontal">
}
function Root({ columnWidths, minWidth = 0, scrollViewProps, children, style, onLayout, ...props }: TableRootProps) {
  const { typography } = useNativeTheme()
  const [viewport, setViewport] = useState(0)
  const [measured, setMeasured] = useState<Record<string, number>>({})
  const entries = measurements(children)
  const count = Math.max(0, ...entries.map((item) => item.column + item.span))
  const minimums = Array.from({ length: count }, () => 16)
  for (const item of entries) {
    if (item.span === 1) minimums[item.column] = Math.max(minimums[item.column], (measured[item.key] ?? 0) + 16)
  }
  for (const item of entries.filter((item) => item.span > 1)) {
    const occupied = minimums.slice(item.column, item.column + item.span).reduce((a, b) => a + b, 0)
    const extra = Math.max(0, (measured[item.key] ?? 0) + 16 - occupied) / item.span
    for (let i = item.column; i < item.column + item.span; i++) minimums[i] += extra
  }
  const intrinsic = minimums.reduce((a, b) => a + b, 0)
  const widths =
    columnWidths ?? minimums.map((width) => width * Math.max(1, Math.max(viewport, minWidth) / (intrinsic || 1)))
  const tableWidth = Math.max(
    minWidth,
    widths.reduce((a, b) => a + b, 0),
    columnWidths ? 0 : viewport
  )
  const all = parts(children)
  const captions = all.filter((child) => isValidElement(child) && child.type === Caption)
  return (
    <View
      {...props}
      onLayout={(event) => {
        setViewport(event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      style={[{ width: "100%", minWidth: 0 }, style]}
    >
      {!columnWidths && (
        <View
          pointerEvents="none"
          accessible={false}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: "absolute", width: 100000, height: 0, overflow: "hidden", opacity: 0 }}
        >
          {entries.map((item) => (
            <View key={item.key} style={{ flexDirection: "row" }}>
              <Text
                accessible={false}
                numberOfLines={1}
                style={[
                  item.medium ? typography.medium : typography.regular,
                  { fontSize: 14, lineHeight: 20 },
                  item.style,
                ]}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width
                  setMeasured((previous) =>
                    previous[item.key] === width ? previous : { ...previous, [item.key]: width }
                  )
                }}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      )}
      <ScrollView horizontal {...scrollViewProps} style={[{ flexGrow: 0 }, scrollViewProps?.style]}>
        <Layout.Provider value={widths}>
          <View role="table" style={{ width: tableWidth }}>
            {all.filter((child) => !isValidElement(child) || child.type !== Caption)}
            {captions}
          </View>
        </Layout.Provider>
      </ScrollView>
    </View>
  )
}
export type TableHeaderProps = ViewProps
export type TableBodyProps = ViewProps
export type TableFooterProps = ViewProps
function Group({
  footer = false,
  header = false,
  children,
  style,
  ...props
}: ViewProps & { footer?: boolean; header?: boolean }) {
  const { colors } = useNativeTheme()
  const rows = parts(children)
  return (
    <Section.Provider value={{ footer }}>
      <View
        role="rowgroup"
        {...props}
        style={[
          footer && { borderTopWidth: 1, borderColor: colors.border, backgroundColor: withOpacity(colors.muted, 0.5) },
          style,
        ]}
      >
        {rows.map((child, index) => (
          <Position.Provider
            key={isValidElement(child) ? (child.key ?? index) : index}
            value={{ column: 0, last: !header && index === rows.length - 1 }}
          >
            {child}
          </Position.Provider>
        ))}
      </View>
    </Section.Provider>
  )
}
function Header(props: TableHeaderProps) {
  return <Group {...props} header />
}
function Body(props: TableBodyProps) {
  return <Group {...props} />
}
function Footer(props: TableFooterProps) {
  return <Group {...props} footer />
}
export type TableRowProps = ViewProps & { selected?: boolean; expanded?: boolean }
function Row({
  selected = false,
  expanded = false,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  accessibilityState,
  ...props
}: TableRowProps) {
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  const { last } = useContext(Position)
  const [hovered, setHovered] = useState(false)
  let column = 0
  return (
    <AnimatedView
      role="row"
      {...props}
      accessibilityState={{ ...accessibilityState, selected }}
      onPointerEnter={(event) => {
        setHovered(true)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setHovered(false)
        onPointerLeave?.(event)
      }}
      style={[
        transition(["backgroundColor"]),
        {
          flexDirection: "row",
          borderBottomWidth: last ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: selected
            ? colors.muted
            : hovered || expanded
              ? withOpacity(colors.muted, 0.5)
              : "transparent",
        },
        style,
      ]}
    >
      {parts(children).map((child, index) => {
        const start = column
        column += isValidElement<CellProps>(child) ? Math.max(1, child.props.colSpan ?? 1) : 1
        return (
          <Position.Provider key={isValidElement(child) ? (child.key ?? index) : index} value={{ column: start, last }}>
            {child}
          </Position.Provider>
        )
      })}
    </AnimatedView>
  )
}
export type TableCellProps = CellProps
export type TableHeadProps = CellProps
function Entry({
  heading = false,
  colSpan = 1,
  align = "start",
  checkbox = false,
  style,
  textStyle,
  children,
  ...props
}: CellProps & { heading?: boolean }) {
  const widths = useContext(Layout)
  const { column } = useContext(Position)
  const { footer } = useContext(Section)
  const { colors, typography } = useNativeTheme()
  const text = [
    heading || footer ? typography.medium : typography.regular,
    {
      fontSize: 14,
      lineHeight: 20,
      color: colors.foreground,
      textAlign: align === "end" ? ("right" as const) : align === "center" ? ("center" as const) : ("auto" as const),
    },
    textStyle,
  ]
  return (
    <View
      role={heading ? "columnheader" : "cell"}
      {...props}
      style={[
        {
          width: widths.slice(column, column + Math.max(1, colSpan)).reduce((a, b) => a + b, 0),
          minHeight: heading ? 39 : 36,
          paddingHorizontal: 8,
          paddingVertical: heading ? 0 : 8,
          paddingEnd: checkbox ? 0 : 8,
          justifyContent: "center",
          alignItems: align === "end" ? "flex-end" : align === "center" ? "center" : "flex-start",
        },
        style,
      ]}
    >
      {parts(children).map((child, index) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text key={index} numberOfLines={1} style={text}>
            {child}
          </Text>
        ) : (
          child
        )
      )}
    </View>
  )
}
function Head(props: TableHeadProps) {
  return <Entry {...props} heading />
}
function Cell(props: TableCellProps) {
  return <Entry {...props} />
}
export type TableCaptionProps = ComponentPropsWithRef<typeof Text>
function Caption({ style, ...props }: TableCaptionProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        typography.regular,
        { marginTop: 16, fontSize: 14, lineHeight: 20, color: colors.mutedForeground, textAlign: "center" },
        style,
      ]}
    />
  )
}
export const Table = { Root, Header, Body, Footer, Row, Head, Cell, Caption }
