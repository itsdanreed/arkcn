"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TagsInput as TagsInputPrimitive } from "@ark-ui/react"
import { XIcon } from "lucide-react"

function TagsInput({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.Root>) {
  return (
    <TagsInputPrimitive.Root
      data-slot="tags-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function TagsInputContext({ ...props }: React.ComponentProps<typeof TagsInputPrimitive.Context>) {
  return <TagsInputPrimitive.Context {...props} />
}

function TagsInputLabel({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.Label>) {
  return (
    <TagsInputPrimitive.Label
      data-slot="tags-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function TagsInputControl({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.Control>) {
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
function TagsInputInput({ className, ...props }: Omit<React.ComponentProps<typeof TagsInputPrimitive.Input>, "id">) {
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

function TagsInputItem({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.Item>) {
  return <TagsInputPrimitive.Item data-slot="tags-input-item" className={cn("inline-flex", className)} {...props} />
}

function TagsInputItemContext({ ...props }: React.ComponentProps<typeof TagsInputPrimitive.ItemContext>) {
  return <TagsInputPrimitive.ItemContext {...props} />
}

function TagsInputItemPreview({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.ItemPreview>) {
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

function TagsInputItemText({ ...props }: React.ComponentProps<typeof TagsInputPrimitive.ItemText>) {
  return <TagsInputPrimitive.ItemText data-slot="tags-input-item-text" {...props} />
}

function TagsInputItemDeleteTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.ItemDeleteTrigger>) {
  return (
    <TagsInputPrimitive.ItemDeleteTrigger
      data-slot="tags-input-item-delete-trigger"
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-sm opacity-50 hover:opacity-100 [&_svg]:size-3",
        className
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </TagsInputPrimitive.ItemDeleteTrigger>
  )
}

function TagsInputItemInput({ className, ...props }: React.ComponentProps<typeof TagsInputPrimitive.ItemInput>) {
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

function TagsInputClearTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.ClearTrigger>) {
  return (
    <TagsInputPrimitive.ClearTrigger
      data-slot="tags-input-clear-trigger"
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </TagsInputPrimitive.ClearTrigger>
  )
}

function TagsInputHiddenInput({ ...props }: React.ComponentProps<typeof TagsInputPrimitive.HiddenInput>) {
  return <TagsInputPrimitive.HiddenInput {...props} />
}

export {
  TagsInput,
  TagsInputClearTrigger,
  TagsInputContext,
  TagsInputControl,
  TagsInputHiddenInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemContext,
  TagsInputItemDeleteTrigger,
  TagsInputItemInput,
  TagsInputItemPreview,
  TagsInputItemText,
  TagsInputLabel,
}
