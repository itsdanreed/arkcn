"use client"

import { ark } from "@ark-ui/react"
import { useMenu, useMenuContext, useMenuItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu as DropdownMenuPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"
import { CheckIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function DropdownMenuRoot({ positioning, lazyMount = true, unmountOnExit = true, ...props }: DropdownMenuRootProps) {
  return (
    <DropdownMenuPrimitive.Root
      positioning={{ placement: "bottom-start", gutter: 4, ...positioning }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function DropdownMenuPortal({ ...props }: DropdownMenuPortalProps) {
  return <PortalPrimitive {...props} />
}

function DropdownMenuContext({ ...props }: DropdownMenuContextProps) {
  return <DropdownMenuPrimitive.Context {...props} />
}

function DropdownMenuTrigger({ ...props }: DropdownMenuTriggerProps) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuPositioner({ className, ...props }: DropdownMenuPositionerProps) {
  return (
    <DropdownMenuPrimitive.Positioner
      data-slot="dropdown-menu-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function DropdownMenuContent({ className, ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--reference-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  )
}

function DropdownMenuArrow({ className, ...props }: DropdownMenuArrowProps) {
  return (
    <DropdownMenuPrimitive.Arrow
      data-slot="dropdown-menu-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <DropdownMenuPrimitive.ArrowTip
            data-slot="dropdown-menu-arrow-tip"
            className="border-t border-l border-foreground/10"
          />
        </>
      )}
    </DropdownMenuPrimitive.Arrow>
  )
}

function DropdownMenuItemGroup({ ...props }: DropdownMenuItemGroupProps) {
  return <DropdownMenuPrimitive.ItemGroup data-slot="dropdown-menu-group" {...props} />
}

const itemClassName =
  "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive"

function DropdownMenuItem({ className, inset, variant = "default", value, ...props }: DropdownMenuItemProps) {
  const id = React.useId()
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      value={value ?? id}
      className={cn(itemClassName, className)}
      {...props}
    />
  )
}

function DropdownMenuItemText({ ...props }: DropdownMenuItemTextProps) {
  return <DropdownMenuPrimitive.ItemText data-slot="dropdown-menu-item-text" {...props} />
}

function DropdownMenuItemIndicator({ className, ...props }: DropdownMenuItemIndicatorProps) {
  return (
    <DropdownMenuPrimitive.ItemIndicator
      data-slot="dropdown-menu-item-indicator"
      className={cn("pointer-events-none absolute right-2 flex items-center justify-center", className)}
      {...props}
    />
  )
}

const optionItemClassName =
  "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function DropdownMenuCheckboxItem({
  className,
  children,
  checked = false,
  inset,
  value,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const id = React.useId()
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(optionItemClassName, className)}
      checked={checked}
      value={value ?? id}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <DropdownMenuItemIndicator data-slot="dropdown-menu-checkbox-item-indicator">
            <CheckIcon />
          </DropdownMenuItemIndicator>
          {children}
        </>
      )}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioItemGroup({ ...props }: DropdownMenuRadioItemGroupProps) {
  return <DropdownMenuPrimitive.RadioItemGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({ className, children, inset, ...props }: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(optionItemClassName, className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <DropdownMenuItemIndicator data-slot="dropdown-menu-radio-item-indicator">
            <CheckIcon />
          </DropdownMenuItemIndicator>
          {children}
        </>
      )}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuItemGroupLabel({ className, inset, ...props }: DropdownMenuItemGroupLabelProps) {
  return (
    <DropdownMenuPrimitive.ItemGroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  return (
    <ark.span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ lazyMount = true, unmountOnExit = true, ...props }: DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function DropdownMenuTriggerItem({ className, inset, children, ...props }: DropdownMenuTriggerItemProps) {
  return (
    <DropdownMenuPrimitive.TriggerItem
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          {children}
          <ChevronRightIcon className="ml-auto" />
        </>
      )}
    </DropdownMenuPrimitive.TriggerItem>
  )
}

function DropdownMenuSubContent({ className, ...props }: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-sub-content"
          className={cn(
            "z-50 min-w-24 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  )
}

/** Render-prop access to one item's state (`{ selected, highlighted, disabled, ... }`). */
function DropdownMenuItemContext({ ...props }: DropdownMenuItemContextProps) {
  return <DropdownMenuPrimitive.ItemContext {...props} />
}

/** Opens the menu from a right-click (context-menu style) instead of a click. */
function DropdownMenuContextTrigger({ ...props }: DropdownMenuContextTriggerProps) {
  return <DropdownMenuPrimitive.ContextTrigger data-slot="dropdown-menu-context-trigger" {...props} />
}

/** Open-state indicator for a trigger; rotates when open. */
function DropdownMenuIndicator({ className, children, ...props }: DropdownMenuIndicatorProps) {
  return (
    <DropdownMenuPrimitive.Indicator
      data-slot="dropdown-menu-indicator"
      className={cn("inline-flex transition-transform data-[state=open]:rotate-180 [&_svg]:size-4", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <ChevronDownIcon />}</>}
    </DropdownMenuPrimitive.Indicator>
  )
}

function DropdownMenuRootProvider(props: DropdownMenuRootProviderProps) {
  return <DropdownMenuPrimitive.RootProvider {...props} />
}

function DropdownMenuArrowTip({ className, ...props }: DropdownMenuArrowTipProps) {
  return <DropdownMenuPrimitive.ArrowTip data-slot="menu-arrow-tip" className={cn(className)} {...props} />
}

type DropdownMenuArrowTipProps = React.ComponentProps<typeof DropdownMenuPrimitive.ArrowTip>

type DropdownMenuItemGroupProps = React.ComponentProps<typeof DropdownMenuPrimitive.ItemGroup>

type DropdownMenuItemGroupLabelProps = React.ComponentProps<typeof DropdownMenuPrimitive.ItemGroupLabel> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type DropdownMenuRadioItemGroupProps = React.ComponentProps<typeof DropdownMenuPrimitive.RadioItemGroup>

type DropdownMenuTriggerItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.TriggerItem> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type DropdownMenuRootProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root>

type DropdownMenuRootProviderProps = React.ComponentProps<typeof DropdownMenuPrimitive.RootProvider>

type DropdownMenuArrowProps = React.ComponentProps<typeof DropdownMenuPrimitive.Arrow>

type DropdownMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
  "checked" | "value"
> & {
  /** Checked state of the item. */
  checked?: boolean
  value?: string
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>

type DropdownMenuContextProps = React.ComponentProps<typeof DropdownMenuPrimitive.Context>

type DropdownMenuItemProps = Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Item>, "value"> & {
  value?: string
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
  variant?: "default" | "destructive"
}

type DropdownMenuItemIndicatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>

type DropdownMenuItemTextProps = React.ComponentProps<typeof DropdownMenuPrimitive.ItemText>

type DropdownMenuPortalProps = React.ComponentProps<typeof PortalPrimitive>

type DropdownMenuPositionerProps = React.ComponentProps<typeof DropdownMenuPrimitive.Positioner>

type DropdownMenuRadioItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Separator>

type DropdownMenuShortcutProps = React.ComponentProps<typeof ark.span>

type DropdownMenuSubProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root>

type DropdownMenuSubContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>

type DropdownMenuTriggerProps = React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>

type DropdownMenuItemContextProps = React.ComponentProps<typeof DropdownMenuPrimitive.ItemContext>

type DropdownMenuContextTriggerProps = React.ComponentProps<typeof DropdownMenuPrimitive.ContextTrigger>

type DropdownMenuIndicatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Indicator>

const DropdownMenu = {
  ArrowTip: DropdownMenuArrowTip,
  ItemGroup: DropdownMenuItemGroup,
  ItemGroupLabel: DropdownMenuItemGroupLabel,
  RadioItemGroup: DropdownMenuRadioItemGroup,
  TriggerItem: DropdownMenuTriggerItem,
  Root: DropdownMenuRoot,
  RootProvider: DropdownMenuRootProvider,
  Arrow: DropdownMenuArrow,
  CheckboxItem: DropdownMenuCheckboxItem,
  Content: DropdownMenuContent,
  Context: DropdownMenuContext,
  Item: DropdownMenuItem,
  ItemIndicator: DropdownMenuItemIndicator,
  ItemText: DropdownMenuItemText,
  Portal: DropdownMenuPortal,
  Positioner: DropdownMenuPositioner,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubContent: DropdownMenuSubContent,
  Trigger: DropdownMenuTrigger,
  ItemContext: DropdownMenuItemContext,
  ContextTrigger: DropdownMenuContextTrigger,
  Indicator: DropdownMenuIndicator,
}

export {
  useMenu,
  useMenuContext,
  useMenuItemContext,
  DropdownMenu,
  type DropdownMenuArrowTipProps,
  type DropdownMenuItemGroupProps,
  type DropdownMenuItemGroupLabelProps,
  type DropdownMenuRadioItemGroupProps,
  type DropdownMenuTriggerItemProps,
  type DropdownMenuRootProps,
  type DropdownMenuRootProviderProps,
  type DropdownMenuArrowProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuContextProps,
  type DropdownMenuItemProps,
  type DropdownMenuItemIndicatorProps,
  type DropdownMenuItemTextProps,
  type DropdownMenuPortalProps,
  type DropdownMenuPositionerProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuShortcutProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuItemContextProps,
  type DropdownMenuContextTriggerProps,
  type DropdownMenuIndicatorProps,
}
