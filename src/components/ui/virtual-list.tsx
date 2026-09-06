"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* -------------------------------- context -------------------------------- */

type VirtualItem = {
  index: number
  key: React.Key
  /** Offset from the top of the content, in px. */
  start: number
  size: number
  end: number
  /** False until the row's real height has been measured. */
  measured: boolean
}

type ScrollAlign = "auto" | "start" | "center" | "end"

type VirtualListContextValue = {
  count: number
  items: VirtualItem[]
  totalSize: number
  /** First and last rendered index (overscan included), or null when empty. */
  range: { start: number; end: number } | null
  measure: (index: number, size: number) => void
  scrollToIndex: (index: number, options?: { align?: ScrollAlign; behavior?: ScrollBehavior }) => void
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void
  viewportRef: React.RefObject<HTMLDivElement | null>
  getItemKey: (index: number) => React.Key
}

const VirtualListContext = React.createContext<VirtualListContextValue | null>(null)

function useVirtualList() {
  const ctx = React.useContext(VirtualListContext)
  if (!ctx) throw new Error("VirtualList parts must be used inside <VirtualList>")
  return ctx
}

/* -------------------------------- helpers -------------------------------- */

/** Largest index whose start is <= offset. */
function findIndex(starts: Float64Array, count: number, offset: number) {
  let lo = 0
  let hi = count - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (starts[mid] <= offset) lo = mid
    else hi = mid - 1
  }
  return lo
}

/* ---------------------------------- root --------------------------------- */

type VirtualListProps = Omit<React.ComponentProps<"div">, "children"> & {
  count: number
  /** Row height before measurement (a number, or per index). */
  estimateSize?: number | ((index: number) => number)
  /** Rows rendered beyond the visible window on each side. */
  overscan?: number
  gap?: number
  paddingStart?: number
  paddingEnd?: number
  getItemKey?: (index: number) => React.Key
  /** Fires when the rendered window changes. */
  onRangeChange?: (range: { start: number; end: number } | null) => void
  children: React.ReactNode
}

function VirtualList({
  count,
  estimateSize = 36,
  overscan = 6,
  gap = 0,
  paddingStart = 0,
  paddingEnd = 0,
  getItemKey = (index) => index,
  onRangeChange,
  className,
  children,
  ...props
}: VirtualListProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const sizes = React.useRef(new Map<number, number>())
  const [version, setVersion] = React.useState(0)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [viewportSize, setViewportSize] = React.useState(0)
  const estimate = React.useCallback(
    (index: number) => (typeof estimateSize === "function" ? estimateSize(index) : estimateSize),
    [estimateSize]
  )

  // Prefix sums of row starts; recomputed when a measurement or the count changes.
  const layout = React.useMemo(() => {
    const starts = new Float64Array(count)
    let offset = paddingStart
    for (let i = 0; i < count; i++) {
      starts[i] = offset
      offset += (sizes.current.get(i) ?? estimate(i)) + (i < count - 1 ? gap : 0)
    }
    return { starts, totalSize: offset + paddingEnd }
    // `version` is the measurement tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, estimate, gap, paddingStart, paddingEnd, version])

  const range = React.useMemo(() => {
    if (count === 0 || viewportSize === 0) return count === 0 ? null : { start: 0, end: Math.min(count - 1, overscan) }
    const first = findIndex(layout.starts, count, scrollTop)
    const last = findIndex(layout.starts, count, scrollTop + viewportSize)
    return { start: Math.max(0, first - overscan), end: Math.min(count - 1, last + overscan) }
  }, [count, viewportSize, scrollTop, layout, overscan])

  const items = React.useMemo(() => {
    if (!range) return []
    const out: VirtualItem[] = []
    for (let i = range.start; i <= range.end; i++) {
      const measured = sizes.current.has(i)
      const size = sizes.current.get(i) ?? estimate(i)
      out.push({ index: i, key: getItemKey(i), start: layout.starts[i], size, end: layout.starts[i] + size, measured })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, layout, estimate, getItemKey, version])

  const onRangeRef = React.useRef(onRangeChange)
  onRangeRef.current = onRangeChange
  const lastRange = React.useRef<string>("")
  React.useEffect(() => {
    const key = range ? `${range.start}-${range.end}` : "none"
    if (key === lastRange.current) return
    lastRange.current = key
    onRangeRef.current?.(range)
  }, [range])

  // Drop stale measurements when the list shrinks.
  React.useEffect(() => {
    let dirty = false
    for (const index of sizes.current.keys()) {
      if (index >= count) {
        sizes.current.delete(index)
        dirty = true
      }
    }
    if (dirty) setVersion((v) => v + 1)
  }, [count])

  const measure = React.useCallback((index: number, size: number) => {
    const prev = sizes.current.get(index)
    if (prev !== undefined && Math.abs(prev - size) < 0.5) return
    sizes.current.set(index, size)
    setVersion((v) => v + 1)
  }, [])

  React.useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setViewportSize(el.clientHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scrollToOffset = React.useCallback((offset: number, behavior: ScrollBehavior = "auto") => {
    viewportRef.current?.scrollTo({ top: offset, behavior })
  }, [])

  const pending = React.useRef<{ index: number; align: ScrollAlign; tries: number } | null>(null)
  const offsetFor = React.useCallback(
    (index: number, align: ScrollAlign) => {
      const el = viewportRef.current
      if (!el) return 0
      const start = layout.starts[index] ?? 0
      const size = sizes.current.get(index) ?? estimate(index)
      const height = el.clientHeight
      let resolved = align
      if (align === "auto") {
        if (start < el.scrollTop) resolved = "start"
        else if (start + size > el.scrollTop + height) resolved = "end"
        else return el.scrollTop
      }
      if (resolved === "start") return start
      if (resolved === "end") return start + size - height
      return start + size / 2 - height / 2
    },
    [layout, estimate]
  )

  const scrollToIndex = React.useCallback(
    (index: number, options?: { align?: ScrollAlign; behavior?: ScrollBehavior }) => {
      const clamped = Math.max(0, Math.min(count - 1, index))
      const align = options?.align ?? "auto"
      pending.current = { index: clamped, align, tries: 0 }
      scrollToOffset(offsetFor(clamped, align), options?.behavior)
    },
    [count, offsetFor, scrollToOffset]
  )

  // Estimated rows shift as they get measured: re-aim at the target a few times.
  React.useLayoutEffect(() => {
    const p = pending.current
    const el = viewportRef.current
    if (!p || !el) return
    if (p.tries >= 4 || !sizes.current.has(p.index)) {
      if (p.tries >= 4) pending.current = null
      return
    }
    const target = offsetFor(p.index, p.align === "auto" ? "start" : p.align)
    if (Math.abs(el.scrollTop - target) > 1) {
      p.tries += 1
      el.scrollTop = target
    } else pending.current = null
  })

  const ctx: VirtualListContextValue = {
    count,
    items,
    totalSize: layout.totalSize,
    range,
    measure,
    scrollToIndex,
    scrollToOffset,
    viewportRef,
    getItemKey,
  }

  return (
    <VirtualListContext.Provider value={ctx}>
      <VirtualListScroll onScroll={setScrollTop} />
      <div data-slot="virtual-list" className={cn("flex min-h-0 flex-col", className)} {...props}>
        {children}
      </div>
    </VirtualListContext.Provider>
  )
}

/** Attaches the scroll listener once the viewport mounts (kept out of the root's render). */
function VirtualListScroll({ onScroll }: { onScroll: (top: number) => void }) {
  const ctx = useVirtualList()
  React.useEffect(() => {
    const el = ctx.viewportRef.current
    if (!el) return
    const handler = () => onScroll(el.scrollTop)
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [ctx.viewportRef, onScroll])
  return null
}

/* --------------------------------- parts --------------------------------- */

function VirtualListViewport({ className, ...props }: React.ComponentProps<"div">) {
  const ctx = useVirtualList()
  return (
    <div
      ref={ctx.viewportRef}
      data-slot="virtual-list-viewport"
      className={cn("relative min-h-0 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  )
}

/** Sized to the whole list so the scrollbar is right; rows position inside it. */
function VirtualListContent({ className, style, ...props }: React.ComponentProps<"div">) {
  const ctx = useVirtualList()
  return (
    <div
      data-slot="virtual-list-content"
      className={cn("relative w-full", className)}
      style={{ height: ctx.totalSize, ...style }}
      {...props}
    />
  )
}

/** Renders the visible window. The child renders one row and must return a `VirtualListItem`. */
function VirtualListItems({ children }: { children: (item: VirtualItem) => React.ReactNode }) {
  const ctx = useVirtualList()
  return (
    <>
      {ctx.items.map((item) => (
        <React.Fragment key={item.key}>{children(item)}</React.Fragment>
      ))}
    </>
  )
}

function VirtualListItem({ index, className, style, ...props }: React.ComponentProps<"div"> & { index: number }) {
  const { items, measure } = useVirtualList()
  const item = items.find((i) => i.index === index)
  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      const run = () => measure(index, el.getBoundingClientRect().height)
      run()
      const ro = new ResizeObserver(run)
      ro.observe(el)
      // React 19 ref cleanup
      return () => ro.disconnect()
    },
    [measure, index]
  )
  return (
    <div
      ref={ref}
      data-slot="virtual-list-item"
      data-index={index}
      className={cn("absolute inset-x-0 top-0", className)}
      style={{ transform: `translateY(${item?.start ?? 0}px)`, ...style }}
      {...props}
    />
  )
}

function VirtualListEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const ctx = useVirtualList()
  if (ctx.count > 0) return null
  return (
    <div
      data-slot="virtual-list-empty"
      className={cn("flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children ?? "Nothing to show"}
    </div>
  )
}

export {
  VirtualList,
  VirtualListContent,
  VirtualListEmpty,
  VirtualListItem,
  VirtualListItems,
  VirtualListViewport,
  useVirtualList,
  type VirtualItem,
  type VirtualListProps,
}
