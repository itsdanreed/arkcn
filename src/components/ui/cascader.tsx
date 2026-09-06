"use client"

import * as React from "react"
import { Popover as PopoverPrimitive, createTreeCollection, type TreeCollection, type TreeNode } from "@ark-ui/react"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"
import { useControllable } from "@/lib/controllable"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/* -------------------------------- helpers -------------------------------- */

/** Ancestors (root excluded) followed by the node itself. */
function pathNodes<T extends TreeNode>(collection: TreeCollection<T>, value: string): T[] {
  const node = collection.findNode(value)
  if (!node) return []
  const parents = collection.getParentNodes(value).filter((n) => !collection.isRootNode(n))
  return [...parents, node]
}

function pathValues<T extends TreeNode>(collection: TreeCollection<T>, value: string): string[] {
  return pathNodes(collection, value).map((n) => collection.getNodeValue(n))
}

const itemId = (base: string, value: string) => `${base}-${value.replace(/[^a-zA-Z0-9_-]/g, "_")}`

/* -------------------------------- context -------------------------------- */

type CascaderValueChangeDetails<T extends TreeNode = TreeNode> = {
  /** `[]` or the selected node's value. */
  value: string[]
  /** Nodes from the first level down to the selected node. */
  path: T[]
}

type CascaderContextValue<T extends TreeNode = TreeNode> = {
  collection: TreeCollection<T>
  value: string[]
  setValue: (value: string[]) => void
  /** Branch values open from the first column down; column `i + 1` lists the children of `expandedPath[i]`. */
  expandedPath: string[]
  setExpandedPath: (path: string[]) => void
  highlighted: string | null
  setHighlighted: (value: string | null) => void
  open: boolean
  setOpen: (open: boolean) => void
  query: string
  setQuery: (query: string) => void
  changeOnSelect: boolean
  expandTrigger: "click" | "hover"
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** Activate a node: pick a leaf (and close), or open a branch (and pick it when `changeOnSelect`). */
  activate: (node: T) => void
  /** Expand a branch and highlight it, without picking. */
  expand: (node: T) => void
  clear: () => void
  /** Nodes on the path to the current value. */
  valuePath: T[]
  /** Flat search matches: each entry is a path of nodes. */
  matches: T[][]
  columns: T[][]
  ids: { content: string; item: (value: string) => string }
  contentRef: React.RefObject<HTMLDivElement | null>
  moveHighlight: (key: string) => boolean
}

const CascaderContext = React.createContext<CascaderContextValue | null>(null)

function useCascader<T extends TreeNode = TreeNode>() {
  const ctx = React.useContext(CascaderContext)
  if (!ctx) throw new Error("Cascader parts must be used inside <Cascader>")
  return ctx as unknown as CascaderContextValue<T>
}

/* ---------------------------------- root --------------------------------- */

type CascaderProps<T extends TreeNode> = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Root>,
  "open" | "defaultOpen" | "onOpenChange" | "children"
> & {
  collection: TreeCollection<T>
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: CascaderValueChangeDetails<T>) => void
  /** Let a branch be the answer: clicking it picks it and keeps the popup open. */
  changeOnSelect?: boolean
  /** Open the next column on hover instead of click. */
  expandTrigger?: "click" | "hover"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  children: React.ReactNode
}

function Cascader<T extends TreeNode>({
  collection,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  changeOnSelect = false,
  expandTrigger = "click",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ids: idsProp,
  children,
  ...props
}: CascaderProps<T>) {
  const [value, setValueState] = useControllable<string[]>(valueProp, defaultValue, (next) =>
    onValueChange?.({ value: next, path: next[0] != null ? pathNodes(collection, next[0]) : [] })
  )
  const [open, setOpenState] = useControllable<boolean>(openProp, defaultOpen, (next) => onOpenChange?.({ open: next }))
  const [expandedPath, setExpandedPath] = React.useState<string[]>([])
  const [highlighted, setHighlighted] = React.useState<string | null>(null)
  const [query, setQueryState] = React.useState("")
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const base = React.useId()
  const ids = React.useMemo(
    () => ({ content: idsProp?.content ?? `${base}-content`, item: (v: string) => itemId(`${base}-item`, v) }),
    [base, idsProp?.content]
  )

  const setValue = React.useCallback(
    (next: string[]) => {
      if (!readOnly) setValueState(next)
    },
    [readOnly, setValueState]
  )

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled) return
      if (next) {
        // Start from the current value: its ancestors open, itself highlighted.
        const current = value[0]
        const path = current != null ? pathValues(collection, current) : []
        setExpandedPath(path.slice(0, -1))
        setHighlighted(current ?? null)
      } else {
        setQueryState("")
      }
      setOpenState(next)
    },
    [disabled, value, collection, setOpenState]
  )

  const columns = React.useMemo(() => {
    const cols: T[][] = [collection.getNodeChildren(collection.rootNode)]
    for (const v of expandedPath) {
      const node = collection.findNode(v)
      if (!node) break
      cols.push(collection.getNodeChildren(node))
    }
    return cols
  }, [collection, expandedPath])

  const matches = React.useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []
    const out: T[][] = []
    collection.visit({
      onEnter: (node) => {
        if (collection.isRootNode(node)) return
        if (collection.isBranchNode(node) && !changeOnSelect) return
        if (collection.getNodeDisabled(node)) return
        const path = pathNodes(collection, collection.getNodeValue(node))
        const text = path
          .map((n) => collection.stringifyNode(n))
          .join(" ")
          .toLowerCase()
        if (tokens.every((t) => text.includes(t))) out.push(path)
      },
    })
    return out.slice(0, 50)
  }, [collection, query, changeOnSelect])

  const setQuery = React.useCallback((next: string) => {
    setQueryState(next)
    setHighlighted(null)
  }, [])

  const expand = React.useCallback(
    (node: T) => {
      const v = collection.getNodeValue(node)
      setHighlighted(v)
      if (collection.isBranchNode(node)) setExpandedPath(pathValues(collection, v))
      else setExpandedPath(pathValues(collection, v).slice(0, -1))
    },
    [collection]
  )

  const activate = React.useCallback(
    (node: T) => {
      if (collection.getNodeDisabled(node)) return
      const v = collection.getNodeValue(node)
      if (collection.isBranchNode(node)) {
        expand(node)
        if (changeOnSelect) setValue([v])
        return
      }
      setValue([v])
      setOpen(false)
    },
    [collection, changeOnSelect, expand, setValue, setOpen]
  )

  const clear = React.useCallback(() => setValue([]), [setValue])

  /** Keyboard navigation over the columns (or the search matches). Returns true when handled. */
  const moveHighlight = React.useCallback(
    (key: string) => {
      if (matches.length > 0) {
        const values = matches.map((path) => collection.getNodeValue(path[path.length - 1]))
        const index = highlighted ? values.indexOf(highlighted) : -1
        if (key === "ArrowDown") setHighlighted(values[Math.min(values.length - 1, index + 1)])
        else if (key === "ArrowUp") setHighlighted(values[Math.max(0, index - 1)])
        else if (key === "Home") setHighlighted(values[0])
        else if (key === "End") setHighlighted(values[values.length - 1])
        else if (key === "Enter" && highlighted) {
          const node = collection.findNode(highlighted)
          if (node) activate(node)
        } else return false
        return true
      }
      const enabled = (list: T[]) => list.filter((n) => !collection.getNodeDisabled(n))
      const node = highlighted ? collection.findNode(highlighted) : undefined
      if (!node) {
        const col = enabled(columns[columns.length - 1] ?? [])
        if (col.length && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(key)) {
          setHighlighted(collection.getNodeValue(key === "ArrowUp" || key === "End" ? col[col.length - 1] : col[0]))
          return true
        }
        return false
      }
      const indexPath = collection.getIndexPath(highlighted!) ?? []
      const siblings = enabled(collection.getSiblingNodes(indexPath))
      const index = siblings.indexOf(node)
      const isBranch = collection.isBranchNode(node)
      switch (key) {
        case "ArrowDown":
          if (siblings[index + 1]) setHighlighted(collection.getNodeValue(siblings[index + 1]))
          return true
        case "ArrowUp":
          if (siblings[index - 1]) setHighlighted(collection.getNodeValue(siblings[index - 1]))
          return true
        case "Home":
          setHighlighted(collection.getNodeValue(siblings[0]))
          return true
        case "End":
          setHighlighted(collection.getNodeValue(siblings[siblings.length - 1]))
          return true
        case "ArrowRight": {
          if (!isBranch) return true
          const first = enabled(collection.getNodeChildren(node))[0]
          setExpandedPath(pathValues(collection, highlighted!))
          if (first) setHighlighted(collection.getNodeValue(first))
          return true
        }
        case "ArrowLeft": {
          const parent = collection.getParentNode(highlighted!)
          if (!parent || collection.isRootNode(parent)) return true
          const pv = collection.getNodeValue(parent)
          setHighlighted(pv)
          setExpandedPath(pathValues(collection, pv).slice(0, -1))
          return true
        }
        case "Enter":
        case " ":
          activate(node)
          return true
        default:
          return false
      }
    },
    [collection, columns, matches, highlighted, activate]
  )

  const valuePath = React.useMemo(() => (value[0] != null ? pathNodes(collection, value[0]) : []), [collection, value])

  const ctx: CascaderContextValue<T> = {
    collection,
    value,
    setValue,
    expandedPath,
    setExpandedPath,
    highlighted,
    setHighlighted,
    open,
    setOpen,
    query,
    setQuery,
    changeOnSelect,
    expandTrigger,
    disabled,
    readOnly,
    invalid,
    activate,
    expand,
    clear,
    valuePath,
    matches,
    columns,
    ids,
    contentRef,
    moveHighlight,
  }

  return (
    <CascaderContext.Provider value={ctx as unknown as CascaderContextValue}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={({ open: next }) => setOpen(next)}
        positioning={{ placement: "bottom-start", gutter: 4, ...positioning }}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        ids={{ ...idsProp, content: ids.content }}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </CascaderContext.Provider>
  )
}

/* -------------------------------- trigger -------------------------------- */

function CascaderTrigger({
  className,
  size = "default",
  variant = "default",
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "default"; variant?: "default" | "unstyled" }) {
  const ctx = useCascader()
  return (
    <PopoverTrigger asChild>
      <div
        data-slot="cascader-trigger"
        role="combobox"
        aria-haspopup="tree"
        aria-expanded={ctx.open}
        aria-controls={ctx.open ? ctx.ids.content : undefined}
        aria-disabled={ctx.disabled || undefined}
        aria-invalid={ctx.invalid || undefined}
        aria-readonly={ctx.readOnly || undefined}
        tabIndex={ctx.disabled ? -1 : 0}
        data-size={size}
        data-variant={variant}
        data-state={ctx.open ? "open" : "closed"}
        data-disabled={ctx.disabled ? "" : undefined}
        data-invalid={ctx.invalid ? "" : undefined}
        data-placeholder-shown={ctx.value.length === 0 ? "" : undefined}
        className={cn(
          "flex cursor-default items-center justify-between gap-1.5 text-sm whitespace-nowrap outline-none select-none data-placeholder-shown:text-muted-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          variant === "default" &&
            "w-full rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40",
          className
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || ctx.disabled) return
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault()
            ctx.setOpen(true)
          } else if ((event.key === "Backspace" || event.key === "Delete") && ctx.value.length) {
            ctx.clear()
          }
        }}
        {...props}
      >
        {children}
      </div>
    </PopoverTrigger>
  )
}

function CascaderIndicator({ className, children, ...props }: React.ComponentProps<"span">) {
  const ctx = useCascader()
  return (
    <span
      data-slot="cascader-indicator"
      data-state={ctx.open ? "open" : "closed"}
      className={cn("ml-auto flex shrink-0 items-center text-muted-foreground", className)}
      {...props}
    >
      {children ?? <ChevronDownIcon className="size-4" />}
    </span>
  )
}

/** The selected path as text ("Country / State / City"), or the placeholder. */
function CascaderValue<T extends TreeNode>({
  placeholder,
  separator = " / ",
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  placeholder?: React.ReactNode
  /** Rendered between path segments. */
  separator?: React.ReactNode
  children?: (path: T[]) => React.ReactNode
}) {
  const ctx = useCascader<T>()
  const empty = ctx.valuePath.length === 0
  return (
    <span
      data-slot="cascader-value"
      data-placeholder-shown={empty ? "" : undefined}
      className={cn("flex min-w-0 flex-1 items-center gap-1 truncate text-left", className)}
      {...props}
    >
      {empty
        ? placeholder
        : children
          ? children(ctx.valuePath)
          : ctx.valuePath.map((node, index) => (
              <React.Fragment key={ctx.collection.getNodeValue(node)}>
                {index > 0 && (
                  <span data-slot="cascader-value-separator" className="text-muted-foreground">
                    {separator}
                  </span>
                )}
                <span className={cn(index < ctx.valuePath.length - 1 && "text-muted-foreground")}>
                  {ctx.collection.stringifyNode(node)}
                </span>
              </React.Fragment>
            ))}
    </span>
  )
}

function CascaderClearTrigger({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  const ctx = useCascader()
  if (ctx.value.length === 0 || ctx.readOnly) return null
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      data-slot="cascader-clear-trigger"
      aria-label="Clear selection"
      disabled={ctx.disabled}
      className={cn("-mr-1 text-muted-foreground hover:text-foreground", className)}
      onClick={(event) => {
        event.stopPropagation()
        ctx.clear()
      }}
      onKeyDown={(event) => event.stopPropagation()}
      {...props}
    >
      {children ?? <XIcon />}
    </Button>
  )
}

function CascaderHiddenInput({
  name,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "value"> & { name: string }) {
  const ctx = useCascader()
  return <input type="hidden" name={name} value={ctx.value[0] ?? ""} data-slot="cascader-hidden-input" {...props} />
}

/* -------------------------------- content -------------------------------- */

function CascaderContent({ className, onKeyDown, ...props }: React.ComponentProps<typeof PopoverContent>) {
  const ctx = useCascader()
  // Keep the highlighted item in view.
  React.useEffect(() => {
    if (!ctx.highlighted) return
    const el = ctx.contentRef.current?.querySelector<HTMLElement>(`#${CSS.escape(ctx.ids.item(ctx.highlighted))}`)
    el?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [ctx.highlighted, ctx.ids, ctx.contentRef, ctx.columns.length])
  return (
    <PopoverContent
      ref={ctx.contentRef}
      data-slot="cascader-content"
      className={cn("w-auto min-w-(--reference-width) gap-1 p-1", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.target instanceof HTMLInputElement) {
          // The search keeps left/right for its caret only while it has text.
          const vertical = ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)
          const horizontal = ["ArrowLeft", "ArrowRight"].includes(event.key) && event.target.value === ""
          if (!vertical && !horizontal) return
        }
        if (ctx.moveHighlight(event.key)) event.preventDefault()
      }}
      {...props}
    />
  )
}

function CascaderSearch({
  className,
  placeholder = "Search…",
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "value" | "onChange">) {
  const ctx = useCascader()
  return (
    <InputGroup data-slot="cascader-search" className={cn("h-8 shrink-0", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        role="searchbox"
        placeholder={placeholder}
        value={ctx.query}
        onChange={(event) => ctx.setQuery(event.target.value)}
        aria-activedescendant={ctx.highlighted ? ctx.ids.item(ctx.highlighted) : undefined}
        {...props}
      />
    </InputGroup>
  )
}

/** The column view. Hidden while a search query has matches to show. */
function CascaderColumns<T extends TreeNode>({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { children?: (node: T) => React.ReactNode }) {
  const ctx = useCascader<T>()
  if (ctx.query.trim()) return null
  return (
    <div
      data-slot="cascader-columns"
      role="tree"
      tabIndex={0}
      aria-activedescendant={ctx.highlighted ? ctx.ids.item(ctx.highlighted) : undefined}
      className={cn("flex max-h-72 overflow-x-auto outline-none", className)}
      {...props}
    >
      {ctx.columns.map((nodes, depth) => (
        <CascaderColumn key={depth} depth={depth}>
          {nodes.map((node) =>
            children ? (
              <React.Fragment key={ctx.collection.getNodeValue(node)}>{children(node)}</React.Fragment>
            ) : (
              <CascaderItem key={ctx.collection.getNodeValue(node)} node={node} />
            )
          )}
        </CascaderColumn>
      ))}
    </div>
  )
}

function CascaderColumn({ className, depth, ...props }: React.ComponentProps<"div"> & { depth: number }) {
  return (
    <div
      data-slot="cascader-column"
      role="group"
      data-depth={depth}
      className={cn(
        "flex min-w-40 shrink-0 flex-col gap-px overflow-y-auto not-first:border-l not-first:pl-1 not-last:pr-1",
        className
      )}
      {...props}
    />
  )
}

function CascaderItem<T extends TreeNode>({
  node,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { node: T; children?: React.ReactNode }) {
  const ctx = useCascader<T>()
  const value = ctx.collection.getNodeValue(node)
  const isBranch = ctx.collection.isBranchNode(node)
  const disabled = ctx.collection.getNodeDisabled(node)
  const expanded = ctx.expandedPath.includes(value)
  const selected = ctx.value[0] === value || ctx.valuePath.some((n) => ctx.collection.getNodeValue(n) === value)
  return (
    <div
      id={ctx.ids.item(value)}
      data-slot="cascader-item"
      role="treeitem"
      aria-level={ctx.collection.getDepth(value)}
      aria-expanded={isBranch ? expanded : undefined}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-value={value}
      data-branch={isBranch ? "" : undefined}
      data-expanded={expanded ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-highlighted={ctx.highlighted === value ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex h-7 cursor-default items-center gap-1.5 rounded-md px-2 text-sm outline-none select-none data-expanded:bg-muted data-highlighted:bg-muted data-selected:font-medium data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onMouseEnter={() => {
        if (disabled) return
        if (ctx.expandTrigger === "hover") ctx.expand(node)
        else ctx.setHighlighted(value)
      }}
      onClick={() => ctx.activate(node)}
      {...props}
    >
      {children ?? (
        <>
          <CascaderItemText>{ctx.collection.stringifyNode(node)}</CascaderItemText>
          <CascaderItemIndicator />
        </>
      )}
    </div>
  )
}

function CascaderItemText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="cascader-item-text" className={cn("flex-1 truncate", className)} {...props} />
}

/** Chevron on branches, check on the selected leaf. Reads the nearest item's state from the DOM attributes. */
function CascaderItemIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="cascader-item-indicator"
      className={cn(
        "ml-auto text-muted-foreground not-in-data-selected:**:data-check:hidden in-data-branch:**:data-check:hidden not-in-data-branch:**:data-chevron:hidden",
        className
      )}
      {...props}
    >
      <ChevronRightIcon data-chevron="" />
      <CheckIcon data-check="" />
    </span>
  )
}

/** Flat list of matching paths while searching. */
function CascaderSearchResults<T extends TreeNode>({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { children?: (path: T[]) => React.ReactNode }) {
  const ctx = useCascader<T>()
  if (!ctx.query.trim()) return null
  return (
    <div
      data-slot="cascader-search-results"
      role="listbox"
      className={cn("flex max-h-72 flex-col gap-px overflow-y-auto", className)}
      {...props}
    >
      {ctx.matches.map((path) => {
        const last = path[path.length - 1]
        const value = ctx.collection.getNodeValue(last)
        return children ? (
          <React.Fragment key={value}>{children(path)}</React.Fragment>
        ) : (
          <CascaderSearchResult key={value} path={path} />
        )
      })}
    </div>
  )
}

function CascaderSearchResult<T extends TreeNode>({
  path,
  separator = " / ",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { path: T[]; separator?: React.ReactNode }) {
  const ctx = useCascader<T>()
  const last = path[path.length - 1]
  const value = ctx.collection.getNodeValue(last)
  return (
    <div
      id={ctx.ids.item(value)}
      data-slot="cascader-search-result"
      role="option"
      aria-selected={ctx.value[0] === value}
      data-value={value}
      data-selected={ctx.value[0] === value ? "" : undefined}
      data-highlighted={ctx.highlighted === value ? "" : undefined}
      className={cn(
        "flex h-7 cursor-default items-center gap-1 rounded-md px-2 text-sm outline-none select-none data-highlighted:bg-muted data-selected:font-medium",
        className
      )}
      onMouseEnter={() => ctx.setHighlighted(value)}
      onClick={() => ctx.activate(last)}
      {...props}
    >
      {children ??
        path.map((node, index) => (
          <React.Fragment key={ctx.collection.getNodeValue(node)}>
            {index > 0 && <span className="text-muted-foreground">{separator}</span>}
            <span className={cn("truncate", index < path.length - 1 && "text-muted-foreground")}>
              {ctx.collection.stringifyNode(node)}
            </span>
          </React.Fragment>
        ))}
    </div>
  )
}

function CascaderEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const ctx = useCascader()
  const searching = ctx.query.trim().length > 0
  if (searching ? ctx.matches.length > 0 : ctx.columns[0].length > 0) return null
  return (
    <div
      data-slot="cascader-empty"
      className={cn("px-2 py-4 text-center text-sm text-muted-foreground", className)}
      {...props}
    >
      {children ?? "No results"}
    </div>
  )
}

export {
  Cascader,
  CascaderClearTrigger,
  CascaderColumn,
  CascaderColumns,
  CascaderContent,
  CascaderEmpty,
  CascaderHiddenInput,
  CascaderIndicator,
  CascaderItem,
  CascaderItemIndicator,
  CascaderItemText,
  CascaderSearch,
  CascaderSearchResult,
  CascaderSearchResults,
  CascaderTrigger,
  CascaderValue,
  createTreeCollection,
  useCascader,
  type CascaderProps,
  type CascaderValueChangeDetails,
  type TreeCollection,
  type TreeNode,
}
