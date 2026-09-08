"use client"

import { ark } from "@ark-ui/react"
import { useMenu, useMenuContext, useMenuItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu as ContextMenuPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"
import { CheckIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function ContextMenuRoot({ lazyMount = true, unmountOnExit = true, ...props }: ContextMenuRootProps) {
  return <ContextMenuPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function ContextMenuContextTrigger({ className, ...props }: ContextMenuContextTriggerProps) {
  return (
    <ContextMenuPrimitive.ContextTrigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  )
}

function ContextMenuPortal({ ...props }: ContextMenuPortalProps) {
  return <PortalPrimitive {...props} />
}

function ContextMenuContext({ ...props }: ContextMenuContextProps) {
  return <ContextMenuPrimitive.Context {...props} />
}

function ContextMenuPositioner({ className, ...props }: ContextMenuPositionerProps) {
  return (
    <ContextMenuPrimitive.Positioner
      data-slot="context-menu-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function ContextMenuContent({ className, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner>
        <ContextMenuPrimitive.Content
          data-slot="context-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ContextMenuPositioner>
    </ContextMenuPortal>
  )
}

function ContextMenuItemGroup({ ...props }: ContextMenuItemGroupProps) {
  return <ContextMenuPrimitive.ItemGroup data-slot="context-menu-group" {...props} />
}

function ContextMenuItem({ className, inset, variant = "default", value, ...props }: ContextMenuItemProps) {
  const id = React.useId()
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      value={value ?? id}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuItemText({ ...props }: ContextMenuItemTextProps) {
  return <ContextMenuPrimitive.ItemText data-slot="context-menu-item-text" {...props} />
}

function ContextMenuItemIndicator({ className, ...props }: ContextMenuItemIndicatorProps) {
  return (
    <ContextMenuPrimitive.ItemIndicator
      data-slot="context-menu-item-indicator"
      className={cn("pointer-events-none absolute right-2 flex items-center justify-center", className)}
      {...props}
    />
  )
}

const optionItemClassName =
  "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function ContextMenuCheckboxItem({
  className,
  children,
  checked = false,
  inset,
  value,
  ...props
}: ContextMenuCheckboxItemProps) {
  const id = React.useId()
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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
          <ContextMenuItemIndicator data-slot="context-menu-checkbox-item-indicator">
            <CheckIcon />
          </ContextMenuItemIndicator>
          {children}
        </>
      )}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItemGroup({ ...props }: ContextMenuRadioItemGroupProps) {
  return <ContextMenuPrimitive.RadioItemGroup data-slot="context-menu-radio-group" {...props} />
}

function ContextMenuRadioItem({ className, children, inset, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
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
          <ContextMenuItemIndicator data-slot="context-menu-radio-item-indicator">
            <CheckIcon />
          </ContextMenuItemIndicator>
          {children}
        </>
      )}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuItemGroupLabel({ className, inset, ...props }: ContextMenuItemGroupLabelProps) {
  return (
    <ContextMenuPrimitive.ItemGroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className)}
      {...props}
    />
  )
}

function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  return (
    <ark.span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/context-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSub({ lazyMount = true, unmountOnExit = true, ...props }: ContextMenuSubProps) {
  return <ContextMenuPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function ContextMenuTriggerItem({ className, inset, children, ...props }: ContextMenuTriggerItemProps) {
  return (
    <ContextMenuPrimitive.TriggerItem
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
    </ContextMenuPrimitive.TriggerItem>
  )
}

function ContextMenuSubContent({ className, ...props }: ContextMenuSubContentProps) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner>
        <ContextMenuPrimitive.Content
          data-slot="context-menu-sub-content"
          className={cn(
            "z-50 min-w-32 origin-(--transform-origin) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ContextMenuPositioner>
    </ContextMenuPortal>
  )
}

/** Render-prop access to one item's state (`{ selected, highlighted, disabled, ... }`). */
function ContextMenuItemContext({ ...props }: ContextMenuItemContextProps) {
  return <ContextMenuPrimitive.ItemContext {...props} />
}

/** A click trigger for the same menu, alongside the right-click `ContextMenuTrigger`. */
function ContextMenuClickTrigger({ ...props }: ContextMenuClickTriggerProps) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-click-trigger" {...props} />
}

function ContextMenuIndicator({ className, children, ...props }: ContextMenuIndicatorProps) {
  return (
    <ContextMenuPrimitive.Indicator
      data-slot="context-menu-indicator"
      className={cn("inline-flex transition-transform data-[state=open]:rotate-180 [&_svg]:size-4", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <ChevronDownIcon />}</>}
    </ContextMenuPrimitive.Indicator>
  )
}

function ContextMenuArrow({ className, ...props }: ContextMenuArrowProps) {
  return (
    <ContextMenuPrimitive.Arrow
      data-slot="context-menu-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <ContextMenuArrowTip />
        </>
      )}
    </ContextMenuPrimitive.Arrow>
  )
}

function ContextMenuArrowTip({ className, ...props }: ContextMenuArrowTipProps) {
  return (
    <ContextMenuPrimitive.ArrowTip
      data-slot="context-menu-arrow-tip"
      className={cn("border-t border-l border-foreground/10", className)}
      {...props}
    />
  )
}

function ContextMenuRootProvider(props: ContextMenuRootProviderProps) {
  return <ContextMenuPrimitive.RootProvider {...props} />
}

function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-button-trigger" className={cn(className)} {...props} />
}

type ContextMenuContextTriggerProps = React.ComponentProps<typeof ContextMenuPrimitive.ContextTrigger>

type ContextMenuItemGroupProps = React.ComponentProps<typeof ContextMenuPrimitive.ItemGroup>

type ContextMenuItemGroupLabelProps = React.ComponentProps<typeof ContextMenuPrimitive.ItemGroupLabel> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type ContextMenuRadioItemGroupProps = React.ComponentProps<typeof ContextMenuPrimitive.RadioItemGroup>

type ContextMenuTriggerItemProps = React.ComponentProps<typeof ContextMenuPrimitive.TriggerItem> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type ContextMenuRootProps = React.ComponentProps<typeof ContextMenuPrimitive.Root>

type ContextMenuRootProviderProps = React.ComponentProps<typeof ContextMenuPrimitive.RootProvider>

type ContextMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>,
  "checked" | "value"
> & {
  /** Checked state of the item. */
  checked?: boolean
  value?: string
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type ContextMenuContentProps = React.ComponentProps<typeof ContextMenuPrimitive.Content>

type ContextMenuContextProps = React.ComponentProps<typeof ContextMenuPrimitive.Context>

type ContextMenuItemProps = Omit<React.ComponentProps<typeof ContextMenuPrimitive.Item>, "value"> & {
  value?: string
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
  variant?: "default" | "destructive"
}

type ContextMenuItemIndicatorProps = React.ComponentProps<typeof ContextMenuPrimitive.ItemIndicator>

type ContextMenuItemTextProps = React.ComponentProps<typeof ContextMenuPrimitive.ItemText>

type ContextMenuPortalProps = React.ComponentProps<typeof PortalPrimitive>

type ContextMenuPositionerProps = React.ComponentProps<typeof ContextMenuPrimitive.Positioner>

type ContextMenuRadioItemProps = React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  /** Indent the item to align with items that have an indicator. */
  inset?: boolean
}

type ContextMenuSeparatorProps = React.ComponentProps<typeof ContextMenuPrimitive.Separator>

type ContextMenuShortcutProps = React.ComponentProps<typeof ark.span>

type ContextMenuSubProps = React.ComponentProps<typeof ContextMenuPrimitive.Root>

type ContextMenuSubContentProps = React.ComponentProps<typeof ContextMenuPrimitive.Content>

type ContextMenuTriggerProps = React.ComponentProps<typeof ContextMenuPrimitive.Trigger>

type ContextMenuItemContextProps = React.ComponentProps<typeof ContextMenuPrimitive.ItemContext>

type ContextMenuArrowProps = React.ComponentProps<typeof ContextMenuPrimitive.Arrow>

type ContextMenuArrowTipProps = React.ComponentProps<typeof ContextMenuPrimitive.ArrowTip>

type ContextMenuClickTriggerProps = React.ComponentProps<typeof ContextMenuPrimitive.Trigger>

type ContextMenuIndicatorProps = React.ComponentProps<typeof ContextMenuPrimitive.Indicator>

const ContextMenu = {
  ContextTrigger: ContextMenuContextTrigger,
  ItemGroup: ContextMenuItemGroup,
  ItemGroupLabel: ContextMenuItemGroupLabel,
  RadioItemGroup: ContextMenuRadioItemGroup,
  TriggerItem: ContextMenuTriggerItem,
  Root: ContextMenuRoot,
  RootProvider: ContextMenuRootProvider,
  CheckboxItem: ContextMenuCheckboxItem,
  Content: ContextMenuContent,
  Context: ContextMenuContext,
  Item: ContextMenuItem,
  ItemIndicator: ContextMenuItemIndicator,
  ItemText: ContextMenuItemText,
  Portal: ContextMenuPortal,
  Positioner: ContextMenuPositioner,
  RadioItem: ContextMenuRadioItem,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Sub: ContextMenuSub,
  SubContent: ContextMenuSubContent,
  Trigger: ContextMenuTrigger,
  ItemContext: ContextMenuItemContext,
  Arrow: ContextMenuArrow,
  ArrowTip: ContextMenuArrowTip,
  ClickTrigger: ContextMenuClickTrigger,
  Indicator: ContextMenuIndicator,
}

export {
  useMenu,
  useMenuContext,
  useMenuItemContext,
  ContextMenu,
  type ContextMenuContextTriggerProps,
  type ContextMenuItemGroupProps,
  type ContextMenuItemGroupLabelProps,
  type ContextMenuRadioItemGroupProps,
  type ContextMenuTriggerItemProps,
  type ContextMenuRootProps,
  type ContextMenuRootProviderProps,
  type ContextMenuCheckboxItemProps,
  type ContextMenuContentProps,
  type ContextMenuContextProps,
  type ContextMenuItemProps,
  type ContextMenuItemIndicatorProps,
  type ContextMenuItemTextProps,
  type ContextMenuPortalProps,
  type ContextMenuPositionerProps,
  type ContextMenuRadioItemProps,
  type ContextMenuSeparatorProps,
  type ContextMenuShortcutProps,
  type ContextMenuSubProps,
  type ContextMenuSubContentProps,
  type ContextMenuTriggerProps,
  type ContextMenuItemContextProps,
  type ContextMenuArrowProps,
  type ContextMenuArrowTipProps,
  type ContextMenuClickTriggerProps,
  type ContextMenuIndicatorProps,
}
