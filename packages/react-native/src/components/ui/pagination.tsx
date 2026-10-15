import { useEffect, type ComponentPropsWithRef, type ReactNode } from "react"
import { I18nManager, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { useFieldsetContext } from "./fieldset"

export type PaginationPage = { type: "page"; value: number } | { type: "ellipsis" }
export type UsePaginationProps = {
  count?: number
  page?: number
  defaultPage?: number
  pageSize?: number
  defaultPageSize?: number
  siblingCount?: number
  boundaryCount?: number
  disabled?: boolean
  dir?: "ltr" | "rtl"
  onPageChange?: (details: { page: number; pageSize: number }) => void
  onPageSizeChange?: (details: { pageSize: number }) => void
  translations?: Partial<{
    rootLabel: string
    firstTriggerLabel: string
    prevTriggerLabel: string
    nextTriggerLabel: string
    lastTriggerLabel: string
    itemLabel: (details: { page: number; totalPages: number }) => string
  }>
}
const integer = (value: number, minimum: number) =>
  Number.isFinite(value) ? Math.max(minimum, Math.floor(value)) : minimum
const range = (start: number, end: number) => Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
function pageItems(page: number, total: number, siblings: number, boundaries: number): PaginationPage[] {
  const budget = 2 * siblings + 3 + 2 * boundaries
  let values: number[]
  if (total <= budget) values = range(1, total)
  else {
    const left = Math.max(1, page - siblings)
    const right = Math.min(total, page + siblings)
    const leftGap = left > boundaries + 2
    const rightGap = right < total - boundaries - 1
    const edge = budget - 1 - boundaries
    values = !leftGap
      ? [...range(1, edge), ...range(total - boundaries + 1, total)]
      : !rightGap
        ? [...range(1, boundaries), ...range(total - edge + 1, total)]
        : [...range(1, boundaries), ...range(left, right), ...range(total - boundaries + 1, total)]
  }
  const items: PaginationPage[] = []
  let previous = 0
  for (const value of values) {
    if (value - previous === 2) items.push({ type: "page", value: previous + 1 })
    else if (value - previous > 2) items.push({ type: "ellipsis" })
    items.push({ type: "page", value })
    previous = value
  }
  if (total - previous === 1) items.push({ type: "page", value: total })
  else if (total - previous > 1) items.push({ type: "ellipsis" })
  return items
}

/** Native pagination state, without DOM or routing dependencies. */
export function usePagination(props: UsePaginationProps = {}) {
  const count = integer(props.count ?? 1, 0)
  const fieldset = useFieldsetContext()
  const disabled = !!(props.disabled || fieldset.disabled)
  const [rawSize, updateSize] = useControllable(props.pageSize, props.defaultPageSize ?? 10, (pageSize) =>
    props.onPageSizeChange?.({ pageSize })
  )
  const pageSize = integer(rawSize, 1)
  const totalPages = Math.ceil(count / pageSize)
  const [rawPage, updatePage] = useControllable(props.page, props.defaultPage ?? 1, (page) =>
    props.onPageChange?.({ page, pageSize })
  )
  const page = Math.min(integer(rawPage, 1), Math.max(1, totalPages))
  // Persist an uncontrolled clamp when data shrinks, so an old page cannot reappear.
  useEffect(() => {
    if (props.page === undefined && page !== rawPage) updatePage(page)
  }, [page, rawPage, props.page, updatePage])
  const setPage = (next: number) => {
    if (!disabled && Number.isInteger(next) && next >= 1 && next <= totalPages) updatePage(next)
  }
  const pageRange = { start: count === 0 ? 0 : (page - 1) * pageSize, end: Math.min(page * pageSize, count) }
  return {
    count,
    page,
    pageSize,
    totalPages,
    pageRange,
    disabled,
    dir: props.dir ?? (I18nManager.isRTL ? "rtl" : "ltr"),
    translations: {
      rootLabel: "Pagination",
      firstTriggerLabel: "Go to first page",
      prevTriggerLabel: "Go to previous page",
      nextTriggerLabel: "Go to next page",
      lastTriggerLabel: "Go to last page",
      itemLabel: ({ page, totalPages }: { page: number; totalPages: number }) => `Page ${page} of ${totalPages}`,
      ...props.translations,
    },
    pages: pageItems(page, totalPages, integer(props.siblingCount ?? 1, 0), integer(props.boundaryCount ?? 1, 0)),
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
    slice<T>(data: T[]) {
      return data.slice(pageRange.start, pageRange.end)
    },
    setPage,
    setPageSize(next: number) {
      if (!disabled && Number.isInteger(next) && next > 0) updateSize(next)
    },
    goToFirstPage: () => setPage(1),
    goToLastPage: () => setPage(totalPages),
    goToNextPage: () => setPage(page + 1),
    goToPrevPage: () => setPage(page - 1),
  }
}
export type UsePaginationReturn = ReturnType<typeof usePagination>
const [Provider, usePaginationContext] = createRequiredContext<UsePaginationReturn>("Pagination")
export { usePaginationContext }
export type PaginationRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UsePaginationReturn }
function PaginationRootProvider({ value, style, ...props }: PaginationRootProviderProps) {
  return (
    <Provider value={value}>
      <View
        accessibilityLabel={value.translations.rootLabel}
        {...props}
        style={[
          {
            width: "100%",
            flexDirection: value.dir === "rtl" ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          },
          style,
        ]}
      />
    </Provider>
  )
}
export type PaginationRootProps = ComponentPropsWithRef<typeof View> & UsePaginationProps
function PaginationRoot({
  count,
  page,
  defaultPage,
  pageSize,
  defaultPageSize,
  siblingCount,
  boundaryCount,
  disabled,
  dir,
  onPageChange,
  onPageSizeChange,
  translations,
  ...props
}: PaginationRootProps) {
  const value = usePagination({
    count,
    page,
    defaultPage,
    pageSize,
    defaultPageSize,
    siblingCount,
    boundaryCount,
    disabled,
    dir,
    onPageChange,
    onPageSizeChange,
    translations,
  })
  return <PaginationRootProvider {...props} value={value} />
}
export type PaginationContextProps = { children: (api: UsePaginationReturn) => ReactNode }
function PaginationContext({ children }: PaginationContextProps) {
  return children(usePaginationContext())
}
export type PaginationLinkProps = ButtonProps & { isActive?: boolean }
function PaginationLink({ isActive, accessibilityState, ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
      {...props}
      accessibilityState={{ ...accessibilityState, selected: isActive }}
    />
  )
}
export type PaginationItemProps = PaginationLinkProps & { value: number; type?: "page" }
function PaginationItem({ value, type: _type, disabled, onPress, children, ...props }: PaginationItemProps) {
  const api = usePaginationContext()
  const blocked = !!(disabled || api.disabled || value < 1 || value > api.totalPages || !Number.isInteger(value))
  return (
    <PaginationLink
      accessibilityLabel={api.translations.itemLabel({ page: value, totalPages: api.totalPages })}
      {...props}
      isActive={value === api.page}
      disabled={blocked}
      onPress={(event) => {
        if (blocked) return
        onPress?.(event)
        if (!event.defaultPrevented) api.setPage(value)
      }}
    >
      {children ?? value}
    </PaginationLink>
  )
}
export type PaginationFirstTriggerProps = ButtonProps
export type PaginationLastTriggerProps = ButtonProps
export type PaginationNextTriggerProps = ButtonProps
export type PaginationPrevTriggerProps = ButtonProps
function trigger(direction: "first" | "last" | "next" | "prev") {
  return function PaginationTrigger({ disabled, onPress, children, ...props }: ButtonProps) {
    const api = usePaginationContext()
    const backwards = direction === "first" || direction === "prev"
    const blocked = !!(disabled || api.disabled || (backwards ? api.previousPage === null : api.nextPage === null))
    const target = direction === "first" ? 1 : direction === "last" ? api.totalPages : api.page + (backwards ? -1 : 1)
    const glyphs =
      api.dir === "rtl"
        ? { first: "»", prev: "›", next: "‹", last: "«" }
        : { first: "«", prev: "‹", next: "›", last: "»" }
    return (
      <PaginationLink
        accessibilityLabel={api.translations[`${direction}TriggerLabel`]}
        {...props}
        disabled={blocked}
        onPress={(event) => {
          if (blocked) return
          onPress?.(event)
          if (!event.defaultPrevented) api.setPage(target)
        }}
      >
        {children ?? glyphs[direction]}
      </PaginationLink>
    )
  }
}
export type PaginationContentProps = ComponentPropsWithRef<typeof View>
function PaginationContent({ style, ...props }: PaginationContentProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 2 }, style]} />
}
export type PaginationEllipsisProps = ComponentPropsWithRef<typeof View> & { index?: number }
function PaginationEllipsis({ index: _index, children = "…", style, ...props }: PaginationEllipsisProps) {
  const { colors, typography } = useNativeTheme()
  return (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }, style]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={{ ...typography.regular, color: colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}
export type PaginationPreviousProps = PaginationLinkProps & { text?: string; dir?: "ltr" | "rtl" }
export type PaginationNextProps = PaginationPreviousProps
function navigation(next: boolean) {
  return function PaginationNavigation({
    text = next ? "Next" : "Previous",
    dir = I18nManager.isRTL ? "rtl" : "ltr",
    children,
    style,
    ...props
  }: PaginationNextProps) {
    const { colors } = useNativeTheme()
    const { width } = useWindowDimensions()
    const Icon = next !== (dir === "rtl") ? ChevronRight : ChevronLeft
    return (
      <PaginationLink
        accessibilityLabel={next ? "Go to next page" : "Go to previous page"}
        size="default"
        {...props}
        style={(state) => [
          {
            paddingStart: next ? 10 : 6,
            paddingEnd: next ? 6 : 10,
            flexDirection: dir === "rtl" ? "row-reverse" : "row",
          },
          StyleSheet.flatten(typeof style === "function" ? style(state) : style),
        ]}
      >
        {children ?? [
          next && width >= 640 && text,
          <Icon key="icon" size={16} color={colors.foreground} accessible={false} />,
          !next && width >= 640 && text,
        ]}
      </PaginationLink>
    )
  }
}
export const Pagination = {
  Root: PaginationRoot,
  RootProvider: PaginationRootProvider,
  Context: PaginationContext,
  Item: PaginationItem,
  Ellipsis: PaginationEllipsis,
  Content: PaginationContent,
  Link: PaginationLink,
  FirstTrigger: trigger("first"),
  LastTrigger: trigger("last"),
  NextTrigger: trigger("next"),
  PrevTrigger: trigger("prev"),
  Previous: navigation(false),
  Next: navigation(true),
}
