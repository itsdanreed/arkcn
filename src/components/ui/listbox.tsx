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
import { cn } from "@/lib/utils"

function ListboxContext(props: ListboxContextProps) {
  return <ListboxPrimitive.Context {...props} />
}

function ListboxContent({ className, ...props }: ListboxContentProps) {
  return (
    <ListboxPrimitive.Content
      data-slot="listbox-content"
      className={cn(
        "max-h-72 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground outline-none",
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
      className={cn("p-4 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ListboxInput({ className, ...props }: ListboxInputProps) {
  return (
    <ListboxPrimitive.Input
      data-slot="listbox-input"
      className={cn(
        "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ListboxItem({ className, ...props }: ListboxItemProps) {
  return (
    <ListboxPrimitive.Item
      data-slot="listbox-item"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
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
  return <ListboxPrimitive.ItemGroup data-slot="listbox-item-group" className={cn("py-1", className)} {...props} />
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
      className={cn("ml-auto text-primary", className)}
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
      className={cn("text-sm font-medium data-disabled:opacity-50", className)}
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
