"use client"

import * as React from "react"
import {
  Combobox as ComboboxPrimitive,
  Portal as PortalPrimitive,
  createListCollection,
  useComboboxContext,
  useFilter,
  useListCollection,
  type CollectionItem,
  type ListCollection,
} from "@ark-ui/react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupTrigger, InputGroupInput } from "@/components/ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"

function Combobox<T extends CollectionItem>({
  positioning,
  anchor,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Root<T>> & {
  /** Anchor the popup to another element, e.g. a `ComboboxChips` container. */
  anchor?: React.RefObject<HTMLElement | null>
}) {
  return (
    <ComboboxPrimitive.Root
      data-slot="combobox"
      positioning={{
        placement: "bottom-start",
        gutter: 6,
        sameWidth: true,
        ...(anchor ? { getAnchorElement: () => anchor.current } : {}),
        ...positioning,
      }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function ComboboxContext({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.Context>) {
  return <ComboboxPrimitive.Context {...props} />
}

function ComboboxRootLabel({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Label>) {
  return (
    <ComboboxPrimitive.Label
      data-slot="combobox-root-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ComboboxControl({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.Control>) {
  return <ComboboxPrimitive.Control data-slot="combobox-control" {...props} />
}

/**
 * Ark has no value-text part for Combobox. Renders the selected items as
 * text, or `placeholder` when nothing is selected.
 */
function ComboboxValue({
  placeholder,
  children,
  ...props
}: React.ComponentProps<"span"> & { placeholder?: React.ReactNode }) {
  const combobox = useComboboxContext()
  return (
    <span data-slot="combobox-value" data-placeholder-shown={combobox.hasSelectedItems ? undefined : ""} {...props}>
      {children ?? (combobox.hasSelectedItems ? combobox.valueAsString : placeholder)}
    </span>
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function ComboboxTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.Trigger>, "id">) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ClearTrigger>) {
  const combobox = useComboboxContext()
  // Match Base UI: unmount when there is nothing to clear, so the trigger
  // button (hidden via `has-data-[slot=combobox-clear]`) shows again.
  if (!combobox.hasSelectedItems && !combobox.inputValue) return null
  return (
    <ComboboxPrimitive.ClearTrigger data-slot="combobox-clear" className={cn(className)} asChild {...props}>
      <InputGroupTrigger variant="ghost" size="icon-xs">
        <XIcon className="pointer-events-none" />
      </InputGroupTrigger>
    </ComboboxPrimitive.ClearTrigger>
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.Input>, "id"> & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <ComboboxPrimitive.Control asChild>
      <InputGroup className={cn("w-auto", className)}>
        <ComboboxPrimitive.Input asChild disabled={disabled} {...props}>
          <InputGroupInput />
        </ComboboxPrimitive.Input>
        <InputGroupAddon align="inline-end">
          {showTrigger && (
            <InputGroupTrigger
              size="icon-xs"
              variant="ghost"
              asChild
              data-slot="input-group-trigger"
              className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
              disabled={disabled}
            >
              <ComboboxTrigger />
            </InputGroupTrigger>
          )}
          {showClear && <ComboboxClear disabled={disabled} />}
        </InputGroupAddon>
        {children}
      </InputGroup>
    </ComboboxPrimitive.Control>
  )
}

function ComboboxPositioner({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Positioner>) {
  return (
    <ComboboxPrimitive.Positioner
      data-slot="combobox-positioner"
      className={cn("isolate [--z-index:50]", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function ComboboxContent({ className, ...props }: Omit<React.ComponentProps<typeof ComboboxPrimitive.Content>, "id">) {
  return (
    <PortalPrimitive>
      <ComboboxPositioner>
        <ComboboxPrimitive.Content
          data-slot="combobox-content"
          className={cn(
            "group/combobox-content relative z-50 max-h-(--available-height) w-(--reference-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ComboboxPositioner>
    </PortalPrimitive>
  )
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.List>) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)-(--spacing(9))),calc(var(--available-height)-(--spacing(9))))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  item,
  value,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.Item>, "item"> & {
  /** The collection item. Falls back to `value` for string collections. */
  item?: CollectionItem
  value?: string
}) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      item={item ?? value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxItemIndicator>
        <CheckIcon className="pointer-events-none" />
      </ComboboxItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxItemText({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.ItemText>) {
  return <ComboboxPrimitive.ItemText data-slot="combobox-item-text" {...props} />
}

function ComboboxItemIndicator({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ItemIndicator>) {
  return (
    <ComboboxPrimitive.ItemIndicator
      data-slot="combobox-item-indicator"
      className={cn("pointer-events-none absolute right-2 flex size-4 items-center justify-center", className)}
      {...props}
    />
  )
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ItemGroup>) {
  return <ComboboxPrimitive.ItemGroup data-slot="combobox-group" className={cn(className)} {...props} />
}

function ComboboxLabel({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ItemGroupLabel>) {
  return (
    <ComboboxPrimitive.ItemGroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Renders every item in the root's collection through a render function.
 * Ark has no Collection part; this reads the collection from context.
 */
function ComboboxCollection<T extends CollectionItem = CollectionItem>({
  children,
}: {
  children: (item: T, index: number) => React.ReactNode
}) {
  const combobox = useComboboxContext()
  const items = combobox.collection.items as T[]
  return (
    <React.Fragment>
      {items.map((item, index) => (
        <React.Fragment key={combobox.collection.getItemValue(item) ?? index}>{children(item, index)}</React.Fragment>
      ))}
    </React.Fragment>
  )
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("flex w-full justify-center py-2 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * Chips for `multiple` comboboxes. Ark has no chip parts; these read the
 * selected values from context and remove them via `clearValue`.
 */
function ComboboxChips({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Control>) {
  return (
    <ComboboxPrimitive.Control
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  value,
  showRemove = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** The selected value this chip represents. */
  value: string
  showRemove?: boolean
}) {
  const combobox = useComboboxContext()
  return (
    <div
      data-slot="combobox-chip"
      data-value={value}
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="combobox-chip-remove"
          aria-label={`Remove ${value}`}
          disabled={combobox.disabled}
          className="-ml-1 opacity-50 hover:opacity-100"
          onClick={() => combobox.clearValue(value)}
        >
          <XIcon className="pointer-events-none" />
        </Button>
      )}
    </div>
  )
}

function ComboboxChipsInput({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

/** Render-prop access to one item's state (`{ selected, highlighted, disabled, ... }`). */
function ComboboxItemContext({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.ItemContext>) {
  return <ComboboxPrimitive.ItemContext {...props} />
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxContext,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxPositioner,
  ComboboxRootLabel,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  createListCollection,
  useComboboxAnchor,
  useFilter,
  useListCollection,
  type CollectionItem,
  type ListCollection,
  ComboboxItemContext,
}
