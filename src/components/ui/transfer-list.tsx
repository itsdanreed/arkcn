"use client"

import * as React from "react"
import { ark } from "@ark-ui/react"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"
import { useControllable } from "@/lib/controllable"
import { cn } from "@/lib/utils"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

/* -------------------------------- context -------------------------------- */

type TransferListSide = "source" | "target"
type TransferListDirection = "right" | "left"

type TransferListItemBase = { value: string; label: string; disabled?: boolean }

type TransferListValueChangeDetails<T> = {
  /** Values now on the target side, in catalog order. */
  value: string[]
  items: T[]
  /** What just moved and where. */
  moved: T[]
  direction: TransferListDirection
}

type TransferListContextValue<T = TransferListItemBase> = {
  items: T[]
  itemToValue: (item: T) => string
  itemToString: (item: T) => string
  itemDisabled: (item: T) => boolean
  value: string[]
  /** Items on each side, in catalog order. */
  sides: Record<TransferListSide, T[]>
  /** Visible (searched) items on each side. */
  visible: Record<TransferListSide, T[]>
  query: Record<TransferListSide, string>
  setQuery: (side: TransferListSide, query: string) => void
  selected: Record<TransferListSide, string[]>
  toggle: (side: TransferListSide, value: string, force?: boolean) => void
  selectRange: (side: TransferListSide, from: string, to: string) => void
  selectAll: (side: TransferListSide, checked: boolean) => void
  /** Move the selected (or given) values across. */
  move: (direction: TransferListDirection, values?: string[]) => void
  moveAll: (direction: TransferListDirection) => void
  disabled: boolean
  announcement: string
  focused: Record<TransferListSide, string | null>
  setFocused: (side: TransferListSide, value: string | null) => void
}

const TransferListContext = React.createContext<TransferListContextValue | null>(null)
const TransferListSideContext = React.createContext<TransferListSide | null>(null)

function useTransferList<T = TransferListItemBase>() {
  const ctx = React.useContext(TransferListContext)
  if (!ctx) throw new Error("TransferList parts must be used inside <TransferList>")
  return ctx as unknown as TransferListContextValue<T>
}

function useTransferListSide() {
  const side = React.useContext(TransferListSideContext)
  if (!side) throw new Error("This part must be used inside <TransferListPanel>")
  return side
}

const sideOf = (direction: TransferListDirection): TransferListSide => (direction === "right" ? "source" : "target")

/* ---------------------------------- root --------------------------------- */

type TransferListProps<T> = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  items: T[]
  itemToValue?: (item: T) => string
  itemToString?: (item: T) => string
  itemDisabled?: (item: T) => boolean
  /** Values on the target side. Kept in catalog order. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: TransferListValueChangeDetails<T>) => void
  /** Case-insensitive label match by default. */
  filter?: (item: T, query: string) => boolean
  disabled?: boolean
  /** Labels for the live region: "Moved 3 items to {target}". */
  titles?: Partial<Record<TransferListSide, string>>
}

function TransferList<T = TransferListItemBase>({
  items,
  itemToValue = (item) => (item as TransferListItemBase).value,
  itemToString = (item) => (item as TransferListItemBase).label,
  itemDisabled = (item) => !!(item as TransferListItemBase).disabled,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  filter,
  disabled = false,
  titles,
  className,
  children,
  ...props
}: TransferListProps<T>) {
  const order = React.useMemo(() => new Map(items.map((item, i) => [itemToValue(item), i])), [items, itemToValue])
  const sortValues = React.useCallback(
    (values: string[]) =>
      Array.from(new Set(values))
        .filter((v) => order.has(v))
        .sort((a, b) => order.get(a)! - order.get(b)!),
    [order]
  )
  const [value, setValueState] = useControllable<string[]>(valueProp, defaultValue)
  const [query, setQueryState] = React.useState<Record<TransferListSide, string>>({ source: "", target: "" })
  const [selected, setSelected] = React.useState<Record<TransferListSide, string[]>>({ source: [], target: [] })
  const [focused, setFocusedState] = React.useState<Record<TransferListSide, string | null>>({
    source: null,
    target: null,
  })
  const { message: announcement, announce: setAnnouncement } = useLiveRegion()

  const sides = React.useMemo(() => {
    const target = new Set(value)
    return {
      source: items.filter((item) => !target.has(itemToValue(item))),
      target: items.filter((item) => target.has(itemToValue(item))),
    }
  }, [items, value, itemToValue])

  const matches = React.useCallback(
    (item: T, q: string) =>
      filter ? filter(item, q) : itemToString(item).toLowerCase().includes(q.trim().toLowerCase()),
    [filter, itemToString]
  )
  const visible = React.useMemo(
    () => ({
      source: query.source.trim() ? sides.source.filter((i) => matches(i, query.source)) : sides.source,
      target: query.target.trim() ? sides.target.filter((i) => matches(i, query.target)) : sides.target,
    }),
    [sides, query, matches]
  )

  const setQuery = React.useCallback((side: TransferListSide, q: string) => {
    setQueryState((prev) => ({ ...prev, [side]: q }))
  }, [])
  const setFocused = React.useCallback((side: TransferListSide, v: string | null) => {
    setFocusedState((prev) => (prev[side] === v ? prev : { ...prev, [side]: v }))
  }, [])

  const toggle = React.useCallback((side: TransferListSide, v: string, force?: boolean) => {
    setSelected((prev) => {
      const has = prev[side].includes(v)
      const next = force ?? !has
      if (next === has) return prev
      return { ...prev, [side]: next ? [...prev[side], v] : prev[side].filter((x) => x !== v) }
    })
  }, [])

  const selectRange = React.useCallback(
    (side: TransferListSide, from: string, to: string) => {
      const list = visible[side].filter((i) => !itemDisabled(i)).map(itemToValue)
      const a = list.indexOf(from)
      const b = list.indexOf(to)
      if (a < 0 || b < 0) return
      const range = list.slice(Math.min(a, b), Math.max(a, b) + 1)
      setSelected((prev) => ({ ...prev, [side]: Array.from(new Set([...prev[side], ...range])) }))
    },
    [visible, itemDisabled, itemToValue]
  )

  const selectAll = React.useCallback(
    (side: TransferListSide, checked: boolean) => {
      const list = visible[side].filter((i) => !itemDisabled(i)).map(itemToValue)
      setSelected((prev) => ({
        ...prev,
        [side]: checked ? Array.from(new Set([...prev[side], ...list])) : prev[side].filter((v) => !list.includes(v)),
      }))
    },
    [visible, itemDisabled, itemToValue]
  )

  const move = React.useCallback(
    (direction: TransferListDirection, values?: string[]) => {
      if (disabled) return
      const from = sideOf(direction)
      const allowed = new Set(sides[from].filter((i) => !itemDisabled(i)).map(itemToValue))
      const moving = (values ?? selected[from]).filter((v) => allowed.has(v))
      if (moving.length === 0) return
      const next = sortValues(direction === "right" ? [...value, ...moving] : value.filter((v) => !moving.includes(v)))
      setValueState(next)
      setSelected((prev) => ({ ...prev, [from]: prev[from].filter((v) => !moving.includes(v)) }))
      const movedItems = items.filter((item) => moving.includes(itemToValue(item)))
      const to = direction === "right" ? "target" : "source"
      const title = titles?.[to] ?? (to === "target" ? "the selected list" : "the available list")
      setAnnouncement(
        movedItems.length === 1
          ? `Moved ${itemToString(movedItems[0])} to ${title}.`
          : `Moved ${movedItems.length} items to ${title}.`
      )
      onValueChange?.({
        value: next,
        items: items.filter((i) => next.includes(itemToValue(i))),
        moved: movedItems,
        direction,
      })
    },
    [
      disabled,
      sides,
      selected,
      value,
      items,
      itemToValue,
      itemToString,
      itemDisabled,
      sortValues,
      setValueState,
      onValueChange,
      titles,
      setAnnouncement,
    ]
  )

  const moveAll = React.useCallback(
    (direction: TransferListDirection) => {
      const from = sideOf(direction)
      move(direction, visible[from].map(itemToValue))
    },
    [move, visible, itemToValue]
  )

  const ctx: TransferListContextValue<T> = {
    items,
    itemToValue,
    itemToString,
    itemDisabled,
    value,
    sides,
    visible,
    query,
    setQuery,
    selected,
    toggle,
    selectRange,
    selectAll,
    move,
    moveAll,
    disabled,
    announcement,
    focused,
    setFocused,
  }

  return (
    <TransferListContext.Provider value={ctx as unknown as TransferListContextValue}>
      <div
        data-slot="transfer-list"
        data-disabled={disabled ? "" : undefined}
        className={cn("grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch", className)}
        {...props}
      >
        {children}
        <LiveRegion data-slot="transfer-list-live-region" message={announcement} />
      </div>
    </TransferListContext.Provider>
  )
}

/* ---------------------------------- panel -------------------------------- */

function TransferListPanel({ side, className, ...props }: React.ComponentProps<"div"> & { side: TransferListSide }) {
  const ctx = useTransferList()
  return (
    <TransferListSideContext.Provider value={side}>
      <div
        data-slot="transfer-list-panel"
        data-side={side}
        data-disabled={ctx.disabled ? "" : undefined}
        className={cn(
          "flex min-h-64 min-w-0 flex-col overflow-hidden rounded-lg border border-input bg-background text-sm dark:bg-input/30 data-disabled:opacity-50",
          className
        )}
        {...props}
      />
    </TransferListSideContext.Provider>
  )
}

function TransferListPanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="transfer-list-panel-header"
      className={cn("flex h-9 shrink-0 items-center gap-2 border-b px-2.5", className)}
      {...props}
    />
  )
}

function TransferListPanelTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="transfer-list-panel-title" className={cn("flex-1 truncate font-medium", className)} {...props} />
  )
}

/** "selected / total" for the side; `children` overrides with `(selected, total) => ReactNode`. */
function TransferListPanelCount({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  children?: (selected: number, total: number) => React.ReactNode
}) {
  const ctx = useTransferList()
  const side = useTransferListSide()
  const total = ctx.sides[side].length
  const count = ctx.selected[side].length
  return (
    <span
      data-slot="transfer-list-panel-count"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {children ? children(count, total) : count > 0 ? `${count} / ${total}` : total}
    </span>
  )
}

/** Header checkbox that selects every visible enabled item on this side. */
function TransferListSelectAll({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange">) {
  const ctx = useTransferList()
  const side = useTransferListSide()
  const enabled = ctx.visible[side].filter((i) => !ctx.itemDisabled(i)).map(ctx.itemToValue)
  const count = enabled.filter((v) => ctx.selected[side].includes(v)).length
  const checked = enabled.length > 0 && count === enabled.length ? true : count > 0 ? "indeterminate" : false
  return (
    <Checkbox
      data-slot="transfer-list-select-all"
      aria-label={`Select all ${side === "source" ? "available" : "selected"} items`}
      checked={checked}
      disabled={ctx.disabled || enabled.length === 0}
      onCheckedChange={({ checked: next }) => ctx.selectAll(side, next === true)}
      className={className}
      {...props}
    />
  )
}

function TransferListSearch({
  className,
  placeholder = "Search…",
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "value" | "onChange">) {
  const ctx = useTransferList()
  const side = useTransferListSide()
  return (
    <InputGroup
      data-slot="transfer-list-search"
      className={cn("h-8 shrink-0 rounded-none border-0 border-b shadow-none has-focus-visible:ring-0", className)}
    >
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        role="searchbox"
        placeholder={placeholder}
        value={ctx.query[side]}
        disabled={ctx.disabled}
        onChange={(event) => ctx.setQuery(side, event.target.value)}
        {...props}
      />
    </InputGroup>
  )
}

/* ---------------------------------- items -------------------------------- */

const TransferListRenderContext = React.createContext<((item: unknown) => React.ReactNode) | undefined>(undefined)

/**
 * The listbox for one side. Roving focus; ↑/↓ move, Space toggles, Shift+↑/↓ extends,
 * ⌘/Ctrl+A selects all, Enter (or double-click) moves the focused item across.
 */
function TransferListItems<T = TransferListItemBase>({
  className,
  children,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { children?: (item: T) => React.ReactNode }) {
  const ctx = useTransferList<T>()
  const side = useTransferListSide()
  const ref = React.useRef<HTMLDivElement>(null)
  const list = ctx.visible[side]
  const values = list.map(ctx.itemToValue)
  const focused = ctx.focused[side]
  const active = focused && values.includes(focused) ? focused : (values[0] ?? null)

  const focusValue = (v: string) => {
    ctx.setFocused(side, v)
    ref.current?.querySelector<HTMLElement>(`[data-slot=transfer-list-item][data-value="${CSS.escape(v)}"]`)?.focus()
  }

  return (
    <TransferListRenderContext.Provider value={children as ((item: unknown) => React.ReactNode) | undefined}>
      <div
        ref={ref}
        data-slot="transfer-list-items"
        role="listbox"
        aria-multiselectable
        aria-label={side === "source" ? "Available" : "Selected"}
        data-active-value={active ?? undefined}
        className={cn("flex min-h-0 flex-1 flex-col gap-px overflow-y-auto p-1 outline-none", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || ctx.disabled) return
          const enabledValues = list.filter((i) => !ctx.itemDisabled(i)).map(ctx.itemToValue)
          const index = active ? values.indexOf(active) : -1
          const step = (delta: number) => {
            const next = values[Math.max(0, Math.min(values.length - 1, index + delta))]
            if (!next) return
            if (event.shiftKey && active && enabledValues.includes(active)) ctx.selectRange(side, active, next)
            focusValue(next)
          }
          switch (event.key) {
            case "ArrowDown":
              event.preventDefault()
              step(1)
              break
            case "ArrowUp":
              event.preventDefault()
              step(-1)
              break
            case "Home":
              event.preventDefault()
              if (values[0]) focusValue(values[0])
              break
            case "End":
              event.preventDefault()
              if (values.length) focusValue(values[values.length - 1])
              break
            case " ":
              event.preventDefault()
              if (active && enabledValues.includes(active)) ctx.toggle(side, active)
              break
            case "Enter":
              event.preventDefault()
              if (active && enabledValues.includes(active)) {
                const next = values[index + 1] ?? values[index - 1] ?? null
                ctx.move(side === "source" ? "right" : "left", [active])
                ctx.setFocused(side, next)
                if (next) queueMicrotask(() => focusValue(next))
              }
              break
            case "a":
            case "A":
              if (event.metaKey || event.ctrlKey) {
                event.preventDefault()
                ctx.selectAll(side, true)
              }
              break
          }
        }}
        {...props}
      >
        {list.map((item) => {
          const v = ctx.itemToValue(item)
          return <TransferListItem key={v} item={item} tabIndex={v === active ? 0 : -1} />
        })}
      </div>
    </TransferListRenderContext.Provider>
  )
}

function TransferListItem<T = TransferListItemBase>({
  item,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { item: T; children?: React.ReactNode }) {
  const ctx = useTransferList<T>()
  const side = useTransferListSide()
  const render = React.useContext(TransferListRenderContext)
  const value = ctx.itemToValue(item)
  const disabled = ctx.disabled || ctx.itemDisabled(item)
  const selected = ctx.selected[side].includes(value)
  return (
    <div
      data-slot="transfer-list-item"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-value={value}
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "flex h-7 cursor-default items-center gap-2 rounded-md px-2 outline-none select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset data-selected:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onFocus={() => ctx.setFocused(side, value)}
      onClick={(event) => {
        if (disabled) return
        const anchor = ctx.focused[side]
        if (event.shiftKey && anchor && anchor !== value) ctx.selectRange(side, anchor, value)
        else ctx.toggle(side, value)
        ctx.setFocused(side, value)
      }}
      onDoubleClick={() => {
        if (!disabled) ctx.move(side === "source" ? "right" : "left", [value])
      }}
      {...props}
    >
      {children ?? (
        <>
          <TransferListItemIndicator />
          <TransferListItemText>{render ? render(item) : ctx.itemToString(item)}</TransferListItemText>
        </>
      )}
    </div>
  )
}

/** Checkbox-styled indicator that follows the item's `data-selected`. */
function TransferListItemIndicator({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="transfer-list-item-indicator"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input text-primary-foreground in-data-selected:border-primary in-data-selected:bg-primary not-in-data-selected:**:data-check:hidden dark:bg-input/30 dark:in-data-selected:bg-primary [&_svg]:size-3",
        className
      )}
      {...props}
    >
      {children ?? <CheckIcon data-check="" />}
    </span>
  )
}

function TransferListItemText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="transfer-list-item-text" className={cn("flex-1 truncate", className)} {...props} />
}

function TransferListEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const ctx = useTransferList()
  const side = useTransferListSide()
  if (ctx.visible[side].length > 0) return null
  const searching = ctx.query[side].trim().length > 0
  return (
    <div
      data-slot="transfer-list-empty"
      className={cn(
        "flex flex-1 items-center justify-center px-4 py-6 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children ?? (searching ? "No matches" : "Nothing here")}
    </div>
  )
}

/* -------------------------------- controls ------------------------------- */

function TransferListControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="transfer-list-controls"
      className={cn("flex items-center justify-center gap-1 sm:flex-col", className)}
      {...props}
    />
  )
}

const directionIcon = {
  right: <ChevronRightIcon />,
  left: <ChevronLeftIcon />,
}
const directionAllIcon = {
  right: <ChevronsRightIcon />,
  left: <ChevronsLeftIcon />,
}

/** Moves the selected items in `direction` ("right" = source → target). Polymorphic via `asChild`. */
function TransferListMoveTrigger({
  direction,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { direction: TransferListDirection; asChild?: boolean }) {
  const ctx = useTransferList()
  const from = sideOf(direction)
  const count = ctx.selected[from].filter((v) => ctx.sides[from].some((i) => ctx.itemToValue(i) === v)).length
  const disabled = ctx.disabled || count === 0
  if (asChild) {
    return (
      <ark.button
        asChild
        data-slot="transfer-list-move-trigger"
        data-direction={direction}
        disabled={disabled}
        onClick={() => ctx.move(direction)}
        {...(props as React.ComponentProps<typeof ark.button>)}
      >
        {children}
      </ark.button>
    )
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      data-slot="transfer-list-move-trigger"
      data-direction={direction}
      aria-label={direction === "right" ? `Move ${count} selected right` : `Move ${count} selected left`}
      disabled={disabled}
      onClick={() => ctx.move(direction)}
      className={cn("rotate-90 sm:rotate-0", className)}
      {...props}
    >
      {children ?? directionIcon[direction]}
    </Button>
  )
}

/** Moves every visible item in `direction`. Polymorphic via `asChild`. */
function TransferListMoveAllTrigger({
  direction,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { direction: TransferListDirection; asChild?: boolean }) {
  const ctx = useTransferList()
  const from = sideOf(direction)
  const disabled = ctx.disabled || ctx.visible[from].every((i) => ctx.itemDisabled(i))
  if (asChild) {
    return (
      <ark.button
        asChild
        data-slot="transfer-list-move-all-trigger"
        data-direction={direction}
        disabled={disabled}
        onClick={() => ctx.moveAll(direction)}
        {...(props as React.ComponentProps<typeof ark.button>)}
      >
        {children}
      </ark.button>
    )
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      data-slot="transfer-list-move-all-trigger"
      data-direction={direction}
      aria-label={direction === "right" ? "Move all right" : "Move all left"}
      disabled={disabled}
      onClick={() => ctx.moveAll(direction)}
      className={cn("rotate-90 sm:rotate-0", className)}
      {...props}
    >
      {children ?? directionAllIcon[direction]}
    </Button>
  )
}

export {
  TransferList,
  TransferListControls,
  TransferListEmpty,
  TransferListItem,
  TransferListItemIndicator,
  TransferListItemText,
  TransferListItems,
  TransferListMoveAllTrigger,
  TransferListMoveTrigger,
  TransferListPanel,
  TransferListPanelCount,
  TransferListPanelHeader,
  TransferListPanelTitle,
  TransferListSearch,
  TransferListSelectAll,
  useTransferList,
  type TransferListDirection,
  type TransferListItemBase,
  type TransferListProps,
  type TransferListSide,
  type TransferListValueChangeDetails,
}
