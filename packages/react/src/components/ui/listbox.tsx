"use client"
import * as React from "react"
import type { CollectionItem } from "@ark-ui/react"
import {
  Listbox as ListboxPrimitive,
  useListbox,
  useListboxContext,
  useListboxItemContext,
  createListCollection,
  useListCollection,
  useFilter,
} from "@ark-ui/react"
import { cn } from "../../lib/utils"
import { Input } from "./input"

function ListboxContext(props: ListboxContextProps) {
  return <ListboxPrimitive.Context {...props} />
}

function ListboxContent({ className, ...props }: ListboxContentProps) {
  return (
    <ListboxPrimitive.Content
      data-slot="listbox-content"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground outline-none",
        className
      )}
      {...props}
    />
  )
}

function ListboxEmpty({ className, ...props }: ListboxEmptyProps) {
  return (
    <ListboxPrimitive.Empty
      data-slot="listbox-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function ListboxInput({ className, ...props }: ListboxInputProps) {
  return (
    <Input.Root asChild data-slot="listbox-input" className={className}>
      <ListboxPrimitive.Input {...props} />
    </Input.Root>
  )
}

function ListboxItem({ className, ...props }: ListboxItemProps) {
  return (
    <ListboxPrimitive.Item
      data-slot="listbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ListboxItemContext(props: ListboxItemContextProps) {
  return <ListboxPrimitive.ItemContext {...props} />
}

function ListboxItemGroup({ className, ...props }: ListboxItemGroupProps) {
  return (
    <ListboxPrimitive.ItemGroup
      data-slot="listbox-item-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    />
  )
}

function ListboxItemGroupLabel({ className, ...props }: ListboxItemGroupLabelProps) {
  return (
    <ListboxPrimitive.ItemGroupLabel
      data-slot="listbox-item-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function ListboxItemIndicator({ className, ...props }: ListboxItemIndicatorProps) {
  return (
    <ListboxPrimitive.ItemIndicator
      data-slot="listbox-item-indicator"
      className={cn("ml-auto inline-flex size-4 items-center justify-center [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function ListboxItemText({ className, ...props }: ListboxItemTextProps) {
  return <ListboxPrimitive.ItemText data-slot="listbox-item-text" className={cn("flex-1", className)} {...props} />
}

function ListboxLabel({ className, ...props }: ListboxLabelProps) {
  return (
    <ListboxPrimitive.Label
      data-slot="listbox-label"
      className={cn("text-sm/none font-medium select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function ListboxRoot<T extends CollectionItem>({ className, ...props }: ListboxRootProps<T>) {
  return <ListboxPrimitive.Root data-slot="listbox" className={cn("flex flex-col gap-2", className)} {...props} />
}

function ListboxRootProvider<T extends CollectionItem>({ className, ...props }: ListboxRootProviderProps<T>) {
  return (
    <ListboxPrimitive.RootProvider
      data-slot="listbox-root-provider"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function ListboxValueText({ className, ...props }: ListboxValueTextProps) {
  return <ListboxPrimitive.ValueText data-slot="listbox-value-text" className={cn("text-sm", className)} {...props} />
}

type ListboxRootProps<T extends CollectionItem = CollectionItem> = ListboxPrimitive.RootComponentProps<T>

type ListboxContextProps = React.ComponentProps<typeof ListboxPrimitive.Context>

type ListboxContentProps = React.ComponentProps<typeof ListboxPrimitive.Content>

type ListboxEmptyProps = React.ComponentProps<typeof ListboxPrimitive.Empty>

type ListboxInputProps = React.ComponentProps<typeof ListboxPrimitive.Input>

type ListboxItemProps = React.ComponentProps<typeof ListboxPrimitive.Item>

type ListboxItemContextProps = React.ComponentProps<typeof ListboxPrimitive.ItemContext>

type ListboxItemGroupProps = React.ComponentProps<typeof ListboxPrimitive.ItemGroup>

type ListboxItemGroupLabelProps = React.ComponentProps<typeof ListboxPrimitive.ItemGroupLabel>

type ListboxItemIndicatorProps = React.ComponentProps<typeof ListboxPrimitive.ItemIndicator>

type ListboxItemTextProps = React.ComponentProps<typeof ListboxPrimitive.ItemText>

type ListboxLabelProps = React.ComponentProps<typeof ListboxPrimitive.Label>

type ListboxRootProviderProps<T extends CollectionItem = CollectionItem> = ListboxPrimitive.RootProviderProps<T> &
  React.RefAttributes<HTMLDivElement>

type ListboxValueTextProps = React.ComponentProps<typeof ListboxPrimitive.ValueText>

const Listbox = {
  Root: ListboxRoot,
  Context: ListboxContext,
  Content: ListboxContent,
  Empty: ListboxEmpty,
  Input: ListboxInput,
  Item: ListboxItem,
  ItemContext: ListboxItemContext,
  ItemGroup: ListboxItemGroup,
  ItemGroupLabel: ListboxItemGroupLabel,
  ItemIndicator: ListboxItemIndicator,
  ItemText: ListboxItemText,
  Label: ListboxLabel,
  RootProvider: ListboxRootProvider,
  ValueText: ListboxValueText,
}

export {
  Listbox,
  useListbox,
  useListboxContext,
  useListboxItemContext,
  createListCollection,
  useListCollection,
  useFilter,
  type ListboxRootProps,
  type ListboxContextProps,
  type ListboxContentProps,
  type ListboxEmptyProps,
  type ListboxInputProps,
  type ListboxItemProps,
  type ListboxItemContextProps,
  type ListboxItemGroupProps,
  type ListboxItemGroupLabelProps,
  type ListboxItemIndicatorProps,
  type ListboxItemTextProps,
  type ListboxLabelProps,
  type ListboxRootProviderProps,
  type ListboxValueTextProps,
}
