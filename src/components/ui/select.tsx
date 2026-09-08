"use client"

import { ark } from "@ark-ui/react"
import { useSelect, useSelectContext, useSelectItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select as SelectPrimitive,
  Portal as PortalPrimitive,
  createListCollection,
  type CollectionItem,
  type ListCollection,
} from "@ark-ui/react"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function SelectRoot<T extends CollectionItem>({
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: SelectRootProps<T>) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      positioning={{
        placement: "bottom",
        gutter: 4,
        sameWidth: true,
        ...positioning,
      }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function SelectContext({ ...props }: SelectContextProps) {
  return <SelectPrimitive.Context {...props} />
}

function SelectHiddenSelect({ ...props }: SelectHiddenSelectProps) {
  return <SelectPrimitive.HiddenSelect {...props} />
}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label data-slot="select-root-label" className={cn("text-sm font-medium", className)} {...props} />
  )
}

function SelectControl({ className, ...props }: SelectControlProps) {
  return (
    <SelectPrimitive.Control
      data-slot="select-control"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function SelectItemGroup({ className, ...props }: SelectItemGroupProps) {
  return <SelectPrimitive.ItemGroup data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props} />
}

function SelectValueText({ ...props }: SelectValueTextProps) {
  return <SelectPrimitive.ValueText data-slot="select-value" {...props} />
}

function SelectIndicator({ className, ...props }: SelectIndicatorProps) {
  return (
    <SelectPrimitive.Indicator
      data-slot="select-indicator"
      className={cn("pointer-events-none text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectClearTrigger({ ...props }: SelectClearTriggerProps) {
  return <SelectPrimitive.ClearTrigger data-slot="select-clear-trigger" {...props} />
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
/**
 * `variant="unstyled"` keeps only the layout (flex, gap, icon sizing) so a host
 * can supply its own chrome, e.g. an editable grid cell that already draws the
 * focus ring.
 */
function SelectTrigger({ className, size = "default", variant = "default", children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={cn(
        "flex items-center justify-between gap-1.5 text-sm whitespace-nowrap outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder-shown:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "default" &&
          "w-fit rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {children}
      <SelectIndicator asChild>
        <ChevronDownIcon className="size-4" />
      </SelectIndicator>
    </SelectPrimitive.Trigger>
  )
}

function SelectPositioner({ className, ...props }: SelectPositionerProps) {
  return (
    <SelectPrimitive.Positioner data-slot="select-positioner" className={cn("[--z-index:50]", className)} {...props} />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SelectContent({ className, children, ...props }: SelectContentProps) {
  return (
    <PortalPrimitive>
      <SelectPositioner>
        <SelectPrimitive.Content
          data-slot="select-content"
          className={cn(
            "relative z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {props.asChild ? (
            React.isValidElement(children) ? (
              children
            ) : null
          ) : (
            <>
              <SelectScrollUpButton />
              {children}
              <SelectScrollDownButton />
            </>
          )}
        </SelectPrimitive.Content>
      </SelectPositioner>
    </PortalPrimitive>
  )
}

function SelectList({ ...props }: SelectListProps) {
  return <SelectPrimitive.List data-slot="select-list" {...props} />
}

function SelectItemGroupLabel({ className, ...props }: SelectItemGroupLabelProps) {
  return (
    <SelectPrimitive.ItemGroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, item, value, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      item={item ?? value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <SelectItemIndicator>
            <CheckIcon className="pointer-events-none" />
          </SelectItemIndicator>
          <SelectPrimitive.ItemText data-slot="select-item-text">{children}</SelectPrimitive.ItemText>
        </>
      )}
    </SelectPrimitive.Item>
  )
}

function SelectItemText({ ...props }: SelectItemTextProps) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />
}

function SelectItemIndicator({ className, ...props }: SelectItemIndicatorProps) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      className={cn("pointer-events-none absolute right-2 flex size-4 items-center justify-center", className)}
      {...props}
    />
  )
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <ark.div
      role="separator"
      aria-orientation="horizontal"
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * Ark's Select content is its own scroll container and has no scroll buttons.
 * These reproduce Radix's: shown only when the content can scroll in that
 * direction, and they scroll while hovered.
 */
function useSelectScrollButton(direction: "up" | "down") {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  const getContent = React.useCallback(
    () => ref.current?.closest<HTMLElement>('[data-slot="select-content"]') ?? null,
    []
  )

  React.useEffect(() => {
    const content = getContent()
    if (!content) return
    const update = () => {
      const canUp = content.scrollTop > 0
      const canDown = content.scrollTop + content.clientHeight < content.scrollHeight - 1
      setVisible(direction === "up" ? canUp : canDown)
    }
    update()
    content.addEventListener("scroll", update)
    const observer = new ResizeObserver(update)
    observer.observe(content)
    return () => {
      content.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [direction, getContent])

  const stop = React.useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }, [])

  const start = React.useCallback(() => {
    stop()
    timer.current = window.setInterval(() => {
      getContent()?.scrollBy({ top: direction === "up" ? -8 : 8 })
    }, 40)
  }, [direction, getContent, stop])

  React.useEffect(() => stop, [stop])

  return { ref, visible, start, stop }
}

function SelectScrollUpButton({ className, onPointerEnter, onPointerLeave, ...props }: SelectScrollUpButtonProps) {
  const { ref, visible, start, stop } = useSelectScrollButton("up")
  return (
    <ark.div
      ref={ref}
      aria-hidden
      hidden={!visible}
      data-slot="select-scroll-up-button"
      className={cn(
        "sticky top-0 z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        start()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        stop()
      }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <ChevronUpIcon />
        </>
      )}
    </ark.div>
  )
}

function SelectScrollDownButton({ className, onPointerEnter, onPointerLeave, ...props }: SelectScrollDownButtonProps) {
  const { ref, visible, start, stop } = useSelectScrollButton("down")
  return (
    <ark.div
      ref={ref}
      aria-hidden
      hidden={!visible}
      data-slot="select-scroll-down-button"
      className={cn(
        "sticky bottom-0 z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        start()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        stop()
      }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <ChevronDownIcon />
        </>
      )}
    </ark.div>
  )
}

/** Render-prop access to one item's state (`{ selected, highlighted, disabled, ... }`). */
function SelectItemContext({ ...props }: SelectItemContextProps) {
  return <SelectPrimitive.ItemContext {...props} />
}

function SelectRootProvider<T extends CollectionItem>({ className, ...props }: SelectRootProviderProps<T>) {
  return <SelectPrimitive.RootProvider data-slot="select" className={cn(className)} {...props} />
}

type SelectItemGroupProps = React.ComponentProps<typeof SelectPrimitive.ItemGroup>

type SelectValueTextProps = React.ComponentProps<typeof SelectPrimitive.ValueText>

type SelectRootProps<T extends CollectionItem = CollectionItem> = React.ComponentProps<typeof SelectPrimitive.Root<T>>

type SelectRootProviderProps<T extends CollectionItem = CollectionItem> = React.ComponentProps<
  typeof SelectPrimitive.RootProvider<T>
>

type SelectClearTriggerProps = React.ComponentProps<typeof SelectPrimitive.ClearTrigger>

type SelectContentProps = Omit<React.ComponentProps<typeof SelectPrimitive.Content>, "id">

type SelectContextProps = React.ComponentProps<typeof SelectPrimitive.Context>

type SelectControlProps = React.ComponentProps<typeof SelectPrimitive.Control>

type SelectHiddenSelectProps = React.ComponentProps<typeof SelectPrimitive.HiddenSelect>

type SelectIndicatorProps = React.ComponentProps<typeof SelectPrimitive.Indicator>

type SelectItemProps = Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "item"> & {
  /** The collection item. Falls back to `value` for string collections. */
  item?: CollectionItem
  value?: string
}

type SelectItemIndicatorProps = React.ComponentProps<typeof SelectPrimitive.ItemIndicator>

type SelectItemTextProps = React.ComponentProps<typeof SelectPrimitive.ItemText>

type SelectItemGroupLabelProps = React.ComponentProps<typeof SelectPrimitive.ItemGroupLabel>

type SelectListProps = React.ComponentProps<typeof SelectPrimitive.List>

type SelectPositionerProps = React.ComponentProps<typeof SelectPrimitive.Positioner>

type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>

type SelectScrollDownButtonProps = React.ComponentProps<typeof ark.div>

type SelectScrollUpButtonProps = React.ComponentProps<typeof ark.div>

type SelectSeparatorProps = React.ComponentProps<typeof ark.div>

type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "id"> & {
  size?: "sm" | "default"
  variant?: "default" | "unstyled"
}

type SelectItemContextProps = React.ComponentProps<typeof SelectPrimitive.ItemContext>

const Select = {
  ItemGroup: SelectItemGroup,
  ValueText: SelectValueText,
  Root: SelectRoot,
  RootProvider: SelectRootProvider,
  ClearTrigger: SelectClearTrigger,
  Content: SelectContent,
  Context: SelectContext,
  Control: SelectControl,
  HiddenSelect: SelectHiddenSelect,
  Indicator: SelectIndicator,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  ItemGroupLabel: SelectItemGroupLabel,
  List: SelectList,
  Positioner: SelectPositioner,
  Label: SelectLabel,
  ScrollDownButton: SelectScrollDownButton,
  ScrollUpButton: SelectScrollUpButton,
  Separator: SelectSeparator,
  Trigger: SelectTrigger,
  ItemContext: SelectItemContext,
}

export {
  useSelect,
  useSelectContext,
  useSelectItemContext,
  Select,
  createListCollection,
  type CollectionItem,
  type ListCollection,
  type SelectItemGroupProps,
  type SelectValueTextProps,
  type SelectRootProps,
  type SelectRootProviderProps,
  type SelectClearTriggerProps,
  type SelectContentProps,
  type SelectContextProps,
  type SelectControlProps,
  type SelectHiddenSelectProps,
  type SelectIndicatorProps,
  type SelectItemProps,
  type SelectItemIndicatorProps,
  type SelectItemTextProps,
  type SelectItemGroupLabelProps,
  type SelectListProps,
  type SelectPositionerProps,
  type SelectLabelProps,
  type SelectScrollDownButtonProps,
  type SelectScrollUpButtonProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectItemContextProps,
}
