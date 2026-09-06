"use client"

import * as React from "react"
import { Popover as PopoverPrimitive, createTreeCollection, type TreeCollection, type TreeNode } from "@ark-ui/react"
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useControllable } from "@/lib/controllable"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  TreeView,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchControl,
  TreeViewBranchIndentGuide,
  TreeViewBranchIndicator,
  TreeViewBranchText,
  TreeViewBranchTrigger,
  TreeViewItem,
  TreeViewItemIndicator,
  TreeViewItemText,
  TreeViewNodeCheckbox,
  TreeViewNodeProvider,
  TreeViewTree,
} from "@/components/ui/tree-view"

/* -------------------------------- helpers -------------------------------- */

const uniq = <T,>(list: T[]) => Array.from(new Set(list))

/**
 * Collapses a list of selected leaf values into the top-most nodes that are fully
 * selected, so "Engineering" stands in for every engineer under it.
 */
function collapseValues<T extends TreeNode>(collection: TreeCollection<T>, value: string[]): T[] {
  const selected = new Set(value)
  const out: T[] = []
  const walk = (node: T) => {
    for (const child of collection.getNodeChildren(node)) {
      const v = collection.getNodeValue(child)
      if (collection.isBranchNode(child)) {
        const leaves = collection.getDescendantValues(v)
        if (leaves.length > 0 && leaves.every((l) => selected.has(l))) out.push(child)
        else walk(child)
      } else if (selected.has(v)) out.push(child)
    }
  }
  walk(collection.rootNode)
  return out
}

/* -------------------------------- context -------------------------------- */

type TreeSelectValueChangeDetails<T extends TreeNode = TreeNode> = { value: string[]; nodes: T[] }

type TreeSelectContextValue<T extends TreeNode = TreeNode> = {
  collection: TreeCollection<T>
  /** The collection narrowed by the search query (ancestors of matches kept). */
  filtered: TreeCollection<T>
  value: string[]
  setValue: (value: string[]) => void
  multiple: boolean
  selectableBranches: boolean
  closeOnSelect: boolean
  expandedValue: string[]
  setExpandedValue: (value: string[]) => void
  open: boolean
  setOpen: (open: boolean) => void
  query: string
  setQuery: (query: string) => void
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** Toggle (multiple) or pick (single) a node, with branch semantics. */
  toggle: (node: T) => void
  /** Remove one value, or every leaf under a branch value. */
  remove: (value: string) => void
  clear: () => void
  selectedNodes: T[]
  /** Selected nodes with fully selected branches collapsed to the branch. */
  displayNodes: T[]
  contentRef: React.RefObject<HTMLDivElement | null>
}

const TreeSelectContext = React.createContext<TreeSelectContextValue | null>(null)

function useTreeSelect<T extends TreeNode = TreeNode>() {
  const ctx = React.useContext(TreeSelectContext)
  if (!ctx) throw new Error("TreeSelect parts must be used inside <TreeSelect>")
  return ctx as unknown as TreeSelectContextValue<T>
}

/* ---------------------------------- root --------------------------------- */

type TreeSelectProps<T extends TreeNode> = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Root>,
  "open" | "defaultOpen" | "onOpenChange" | "children"
> & {
  collection: TreeCollection<T>
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: TreeSelectValueChangeDetails<T>) => void
  /** Checkbox selection of leaves; a branch stands for all of its leaves. */
  multiple?: boolean
  /** Single mode only: allow picking a branch itself instead of expanding it. */
  selectableBranches?: boolean
  /** Close after a pick. Defaults to `!multiple`. */
  closeOnSelect?: boolean
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  onExpandedChange?: (details: { expandedValue: string[] }) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  children: React.ReactNode
}

function TreeSelect<T extends TreeNode>({
  collection,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  multiple = false,
  selectableBranches = false,
  closeOnSelect = !multiple,
  expandedValue: expandedProp,
  defaultExpandedValue = [],
  onExpandedChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  children,
  ...props
}: TreeSelectProps<T>) {
  const [value, setValueState] = useControllable<string[]>(valueProp, defaultValue, (next) =>
    onValueChange?.({ value: next, nodes: collection.findNodes(next) })
  )
  const [expandedValue, setExpandedValue] = useControllable<string[]>(expandedProp, defaultExpandedValue, (next) =>
    onExpandedChange?.({ expandedValue: next })
  )
  const [open, setOpenState] = useControllable<boolean>(openProp, defaultOpen, (next) => onOpenChange?.({ open: next }))
  const [query, setQuery] = React.useState("")
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled) return
      setOpenState(next)
      if (!next) setQuery("")
    },
    [disabled, setOpenState]
  )
  const setValue = React.useCallback(
    (next: string[]) => {
      if (readOnly) return
      setValueState(collection.sort(uniq(next)))
    },
    [collection, readOnly, setValueState]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return collection
    return collection.filter((node) => collection.stringifyNode(node).toLowerCase().includes(q))
  }, [collection, query])

  const toggle = React.useCallback(
    (node: T) => {
      const v = collection.getNodeValue(node)
      const isBranch = collection.isBranchNode(node)
      if (multiple) {
        if (isBranch) {
          const leaves = collection.getDescendantValues(v)
          const all = leaves.length > 0 && leaves.every((l) => value.includes(l))
          setValue(all ? value.filter((x) => !leaves.includes(x)) : [...value, ...leaves])
        } else {
          setValue(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
        }
        if (closeOnSelect) setOpen(false)
        return
      }
      if (isBranch && !selectableBranches) return
      setValue([v])
      if (closeOnSelect) setOpen(false)
    },
    [collection, multiple, selectableBranches, closeOnSelect, value, setValue, setOpen]
  )
  const remove = React.useCallback(
    (v: string) => {
      const node = collection.findNode(v)
      const drop = node && collection.isBranchNode(node) ? collection.getDescendantValues(v) : [v]
      setValue(value.filter((x) => !drop.includes(x)))
    },
    [collection, value, setValue]
  )
  const clear = React.useCallback(() => setValue([]), [setValue])

  const selectedNodes = React.useMemo(() => collection.findNodes(value), [collection, value])
  const displayNodes = React.useMemo(
    () => (multiple ? collapseValues(collection, value) : selectedNodes),
    [collection, multiple, value, selectedNodes]
  )

  const ctx: TreeSelectContextValue<T> = {
    collection,
    filtered,
    value,
    setValue,
    multiple,
    selectableBranches,
    closeOnSelect,
    expandedValue,
    setExpandedValue,
    open,
    setOpen,
    query,
    setQuery,
    disabled,
    readOnly,
    invalid,
    toggle,
    remove,
    clear,
    selectedNodes,
    displayNodes,
    contentRef,
  }

  return (
    <TreeSelectContext.Provider value={ctx as unknown as TreeSelectContextValue}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={({ open: next }) => setOpen(next)}
        positioning={{ placement: "bottom-start", gutter: 4, sameWidth: true, ...positioning }}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </TreeSelectContext.Provider>
  )
}

/* -------------------------------- trigger -------------------------------- */

function TreeSelectTrigger({
  className,
  size = "default",
  variant = "default",
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "default"; variant?: "default" | "unstyled" }) {
  const ctx = useTreeSelect()
  return (
    <PopoverTrigger asChild>
      <div
        data-slot="tree-select-trigger"
        role="combobox"
        aria-haspopup="tree"
        aria-expanded={ctx.open}
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
          "flex cursor-default items-center justify-between gap-1.5 text-sm outline-none select-none data-placeholder-shown:text-muted-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          variant === "default" &&
            "w-full rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-[size=default]:min-h-8 data-[size=sm]:min-h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40",
          className
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || ctx.disabled) return
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault()
            ctx.setOpen(true)
          } else if (event.key === "Backspace" && ctx.multiple && ctx.value.length > 0) {
            const last = ctx.displayNodes[ctx.displayNodes.length - 1]
            if (last) ctx.remove(ctx.collection.getNodeValue(last))
          }
        }}
        {...props}
      >
        {children}
      </div>
    </PopoverTrigger>
  )
}

function TreeSelectIndicator({ className, children, ...props }: React.ComponentProps<"span">) {
  const ctx = useTreeSelect()
  return (
    <span
      data-slot="tree-select-indicator"
      data-state={ctx.open ? "open" : "closed"}
      className={cn("ml-auto flex shrink-0 items-center text-muted-foreground", className)}
      {...props}
    >
      {children ?? <ChevronDownIcon className="size-4" />}
    </span>
  )
}

/** Selected labels as text (fully selected branches collapse to the branch), or the placeholder. */
function TreeSelectValue<T extends TreeNode>({
  placeholder,
  separator = ", ",
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  placeholder?: React.ReactNode
  separator?: string
  children?: (nodes: T[]) => React.ReactNode
}) {
  const ctx = useTreeSelect<T>()
  const empty = ctx.displayNodes.length === 0
  return (
    <span
      data-slot="tree-select-value"
      data-placeholder-shown={empty ? "" : undefined}
      className={cn("line-clamp-1 flex-1 text-left", className)}
      {...props}
    >
      {empty
        ? placeholder
        : children
          ? children(ctx.displayNodes)
          : ctx.displayNodes.map((n) => ctx.collection.stringifyNode(n)).join(separator)}
    </span>
  )
}

/** Selected nodes as removable chips (multiple mode). */
function TreeSelectChips<T extends TreeNode>({
  placeholder,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  placeholder?: React.ReactNode
  children?: (node: T) => React.ReactNode
}) {
  const ctx = useTreeSelect<T>()
  const empty = ctx.displayNodes.length === 0
  return (
    <div
      data-slot="tree-select-chips"
      data-placeholder-shown={empty ? "" : undefined}
      className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left", className)}
      {...props}
    >
      {empty
        ? placeholder
        : ctx.displayNodes.map((node) =>
            children ? (
              <React.Fragment key={ctx.collection.getNodeValue(node)}>{children(node)}</React.Fragment>
            ) : (
              <TreeSelectChip key={ctx.collection.getNodeValue(node)} node={node} />
            )
          )}
    </div>
  )
}

function TreeSelectChip<T extends TreeNode>({
  node,
  showRemove = true,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { node: T; showRemove?: boolean }) {
  const ctx = useTreeSelect<T>()
  const value = ctx.collection.getNodeValue(node)
  const label = ctx.collection.stringifyNode(node)
  return (
    <span
      data-slot="tree-select-chip"
      data-value={value}
      data-branch={ctx.collection.isBranchNode(node) ? "" : undefined}
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-data-[slot=tree-select-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children ?? label}
      {showRemove && !ctx.readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="tree-select-chip-remove"
          aria-label={`Remove ${label}`}
          disabled={ctx.disabled}
          className="-ml-1 opacity-50 hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            ctx.remove(value)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <XIcon className="pointer-events-none" />
        </Button>
      )}
    </span>
  )
}

function TreeSelectClearTrigger({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  const ctx = useTreeSelect()
  if (ctx.value.length === 0 || ctx.readOnly) return null
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      data-slot="tree-select-clear-trigger"
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

/** Hidden inputs for native form submission. */
function TreeSelectHiddenInput({
  name,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "value"> & { name: string }) {
  const ctx = useTreeSelect()
  return (
    <>
      {ctx.value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} data-slot="tree-select-hidden-input" {...props} />
      ))}
    </>
  )
}

/* -------------------------------- content -------------------------------- */

function TreeSelectContent({ className, ...props }: React.ComponentProps<typeof PopoverContent>) {
  const ctx = useTreeSelect()
  return (
    <PopoverContent
      ref={ctx.contentRef}
      data-slot="tree-select-content"
      className={cn("w-(--reference-width) min-w-48 gap-1 p-1", className)}
      {...props}
    />
  )
}

function TreeSelectSearch({
  className,
  placeholder = "Search…",
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "value" | "onChange">) {
  const ctx = useTreeSelect()
  return (
    <InputGroup data-slot="tree-select-search" className={cn("h-8 shrink-0", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        role="searchbox"
        placeholder={placeholder}
        value={ctx.query}
        onChange={(event) => ctx.setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            const first = ctx.contentRef.current?.querySelector<HTMLElement>(
              "[data-slot=tree-view-item], [data-slot=tree-view-branch-control]"
            )
            if (first) {
              event.preventDefault()
              first.focus()
            }
          }
        }}
        {...props}
      />
    </InputGroup>
  )
}

function TreeSelectEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const ctx = useTreeSelect()
  if (ctx.filtered.getNodeChildren(ctx.filtered.rootNode).length > 0) return null
  return (
    <div
      data-slot="tree-select-empty"
      className={cn("px-2 py-4 text-center text-sm text-muted-foreground", className)}
      {...props}
    >
      {children ?? "No results"}
    </div>
  )
}

/* ---------------------------------- tree --------------------------------- */

type TreeSelectRenderNode<T extends TreeNode> = (node: T) => React.ReactNode

const TreeSelectRenderContext = React.createContext<TreeSelectRenderNode<TreeNode> | undefined>(undefined)

/**
 * The tree inside the popup. Renders every node of the (filtered) collection;
 * pass a render-prop child to customise the row label.
 */
function TreeSelectTree<T extends TreeNode>({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TreeViewTree>, "children"> & { children?: TreeSelectRenderNode<T> }) {
  const ctx = useTreeSelect<T>()
  const searching = ctx.query.trim().length > 0
  const searchExpanded = React.useMemo(
    () => (searching ? ctx.filtered.getBranchValues() : null),
    [searching, ctx.filtered]
  )
  const roots = ctx.filtered.getNodeChildren(ctx.filtered.rootNode)
  if (roots.length === 0) return null
  return (
    <TreeSelectRenderContext.Provider value={children as TreeSelectRenderNode<TreeNode> | undefined}>
      <TreeView
        collection={ctx.filtered}
        selectionMode={ctx.multiple ? "multiple" : "single"}
        selectedValue={ctx.multiple ? [] : ctx.value}
        onSelectionChange={({ selectedValue }) => {
          const picked = selectedValue.find((v) => ctx.multiple || !ctx.value.includes(v)) ?? selectedValue[0]
          const node = picked != null ? ctx.filtered.findNode(picked) : undefined
          if (node) ctx.toggle(node)
        }}
        checkedValue={ctx.multiple ? ctx.value : undefined}
        onCheckedChange={({ checkedValue }) => ctx.setValue(checkedValue)}
        expandedValue={searchExpanded ?? ctx.expandedValue}
        onExpandedChange={({ expandedValue }) => {
          if (!searching) ctx.setExpandedValue(expandedValue)
        }}
        data-slot="tree-select-tree"
        className="w-full"
      >
        <TreeViewTree className={cn("max-h-72 overflow-y-auto", className)} {...props}>
          {roots.map((node, index) => (
            <TreeSelectNode key={ctx.filtered.getNodeValue(node)} node={node} indexPath={[index]} />
          ))}
        </TreeViewTree>
      </TreeView>
    </TreeSelectRenderContext.Provider>
  )
}

function TreeSelectNode<T extends TreeNode>({ node, indexPath }: { node: T; indexPath: number[] }) {
  const ctx = useTreeSelect<T>()
  const render = React.useContext(TreeSelectRenderContext)
  const value = ctx.filtered.getNodeValue(node)
  const label = render ? render(node) : ctx.filtered.stringifyNode(node)
  const children = ctx.filtered.getNodeChildren(node)
  const isBranch = ctx.filtered.isBranchNode(node)
  return (
    <TreeViewNodeProvider node={node} indexPath={indexPath}>
      {isBranch ? (
        <TreeViewBranch data-slot="tree-select-branch">
          <TreeViewBranchControl>
            <TreeViewBranchTrigger>
              <TreeViewBranchIndicator />
            </TreeViewBranchTrigger>
            {ctx.multiple && <TreeViewNodeCheckbox />}
            <TreeViewBranchText>{label}</TreeViewBranchText>
          </TreeViewBranchControl>
          <TreeViewBranchContent>
            <TreeViewBranchIndentGuide />
            {children.map((child, index) => (
              <TreeSelectNode key={ctx.filtered.getNodeValue(child)} node={child} indexPath={[...indexPath, index]} />
            ))}
          </TreeViewBranchContent>
        </TreeViewBranch>
      ) : (
        <TreeViewItem data-slot="tree-select-item" data-value={value}>
          {ctx.multiple && <TreeViewNodeCheckbox />}
          <TreeViewItemText>{label}</TreeViewItemText>
          {!ctx.multiple && <TreeViewItemIndicator />}
        </TreeViewItem>
      )}
    </TreeViewNodeProvider>
  )
}

export {
  TreeSelect,
  TreeSelectChip,
  TreeSelectChips,
  TreeSelectClearTrigger,
  TreeSelectContent,
  TreeSelectEmpty,
  TreeSelectHiddenInput,
  TreeSelectIndicator,
  TreeSelectNode,
  TreeSelectSearch,
  TreeSelectTree,
  TreeSelectTrigger,
  TreeSelectValue,
  collapseValues,
  createTreeCollection,
  useTreeSelect,
  type TreeCollection,
  type TreeNode,
  type TreeSelectProps,
  type TreeSelectValueChangeDetails,
}
