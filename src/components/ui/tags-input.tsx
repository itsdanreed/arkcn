"use client"

import { useTagsInput, useTagsInputContext, useTagsInputItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { TagsInput as TagsInputPrimitive } from "@ark-ui/react"
import { XIcon } from "lucide-react"

function TagsInputRoot({ className, ...props }: TagsInputRootProps) {
  return (
    <TagsInputPrimitive.Root
      data-slot="tags-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function TagsInputContext({ ...props }: TagsInputContextProps) {
  return <TagsInputPrimitive.Context {...props} />
}

function TagsInputLabel({ className, ...props }: TagsInputLabelProps) {
  return (
    <TagsInputPrimitive.Label
      data-slot="tags-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function TagsInputControl({ className, ...props }: TagsInputControlProps) {
  return (
    <TagsInputPrimitive.Control
      data-slot="tags-input-control"
      className={cn(
        "flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function TagsInputInput({ className, ...props }: TagsInputInputProps) {
  return (
    <TagsInputPrimitive.Input
      data-slot="tags-input-input"
      className={cn(
        "min-w-16 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TagsInputItem({ className, ...props }: TagsInputItemProps) {
  return <TagsInputPrimitive.Item data-slot="tags-input-item" className={cn("inline-flex", className)} {...props} />
}

function TagsInputItemContext({ ...props }: TagsInputItemContextProps) {
  return <TagsInputPrimitive.ItemContext {...props} />
}

function TagsInputItemPreview({ className, ...props }: TagsInputItemPreviewProps) {
  return (
    <TagsInputPrimitive.ItemPreview
      data-slot="tags-input-item-preview"
      className={cn(
        "flex h-[calc(--spacing(5.25))] items-center gap-1 rounded-sm bg-muted pr-0 pl-1.5 text-xs font-medium whitespace-nowrap text-foreground data-highlighted:ring-2 data-highlighted:ring-ring/50 data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function TagsInputItemText({ ...props }: TagsInputItemTextProps) {
  return <TagsInputPrimitive.ItemText data-slot="tags-input-item-text" {...props} />
}

function TagsInputItemDeleteTrigger({ className, children, ...props }: TagsInputItemDeleteTriggerProps) {
  return (
    <TagsInputPrimitive.ItemDeleteTrigger
      data-slot="tags-input-item-delete-trigger"
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-sm opacity-50 hover:opacity-100 [&_svg]:size-3",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <XIcon />}</>}
    </TagsInputPrimitive.ItemDeleteTrigger>
  )
}

function TagsInputItemInput({ className, ...props }: TagsInputItemInputProps) {
  return (
    <TagsInputPrimitive.ItemInput
      data-slot="tags-input-item-input"
      className={cn(
        "h-[calc(--spacing(5.25))] rounded-sm bg-muted px-1.5 text-xs ring-2 ring-ring/50 outline-none",
        className
      )}
      {...props}
    />
  )
}

function TagsInputClearTrigger({ className, children, ...props }: TagsInputClearTriggerProps) {
  return (
    <TagsInputPrimitive.ClearTrigger
      data-slot="tags-input-clear-trigger"
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <XIcon />}</>}
    </TagsInputPrimitive.ClearTrigger>
  )
}

function TagsInputHiddenInput({ ...props }: TagsInputHiddenInputProps) {
  return <TagsInputPrimitive.HiddenInput {...props} />
}

function TagsInputRootProvider({ className, ...props }: TagsInputRootProviderProps) {
  return (
    <TagsInputPrimitive.RootProvider
      data-slot="tags-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type TagsInputRootProps = React.ComponentProps<typeof TagsInputPrimitive.Root>

type TagsInputRootProviderProps = React.ComponentProps<typeof TagsInputPrimitive.RootProvider>

type TagsInputClearTriggerProps = React.ComponentProps<typeof TagsInputPrimitive.ClearTrigger>

type TagsInputContextProps = React.ComponentProps<typeof TagsInputPrimitive.Context>

type TagsInputControlProps = React.ComponentProps<typeof TagsInputPrimitive.Control>

type TagsInputHiddenInputProps = React.ComponentProps<typeof TagsInputPrimitive.HiddenInput>

type TagsInputInputProps = Omit<React.ComponentProps<typeof TagsInputPrimitive.Input>, "id">

type TagsInputItemProps = React.ComponentProps<typeof TagsInputPrimitive.Item>

type TagsInputItemContextProps = React.ComponentProps<typeof TagsInputPrimitive.ItemContext>

type TagsInputItemDeleteTriggerProps = React.ComponentProps<typeof TagsInputPrimitive.ItemDeleteTrigger>

type TagsInputItemInputProps = React.ComponentProps<typeof TagsInputPrimitive.ItemInput>

type TagsInputItemPreviewProps = React.ComponentProps<typeof TagsInputPrimitive.ItemPreview>

type TagsInputItemTextProps = React.ComponentProps<typeof TagsInputPrimitive.ItemText>

type TagsInputLabelProps = React.ComponentProps<typeof TagsInputPrimitive.Label>

const TagsInput = {
  Root: TagsInputRoot,
  RootProvider: TagsInputRootProvider,
  ClearTrigger: TagsInputClearTrigger,
  Context: TagsInputContext,
  Control: TagsInputControl,
  HiddenInput: TagsInputHiddenInput,
  Input: TagsInputInput,
  Item: TagsInputItem,
  ItemContext: TagsInputItemContext,
  ItemDeleteTrigger: TagsInputItemDeleteTrigger,
  ItemInput: TagsInputItemInput,
  ItemPreview: TagsInputItemPreview,
  ItemText: TagsInputItemText,
  Label: TagsInputLabel,
}

export {
  useTagsInput,
  useTagsInputContext,
  useTagsInputItemContext,
  TagsInput,
  type TagsInputRootProps,
  type TagsInputRootProviderProps,
  type TagsInputClearTriggerProps,
  type TagsInputContextProps,
  type TagsInputControlProps,
  type TagsInputHiddenInputProps,
  type TagsInputInputProps,
  type TagsInputItemProps,
  type TagsInputItemContextProps,
  type TagsInputItemDeleteTriggerProps,
  type TagsInputItemInputProps,
  type TagsInputItemPreviewProps,
  type TagsInputItemTextProps,
  type TagsInputLabelProps,
}
