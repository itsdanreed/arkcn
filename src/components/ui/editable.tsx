"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Editable as EditablePrimitive } from "@ark-ui/react"

function Editable({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Root>) {
  return (
    <EditablePrimitive.Root data-slot="editable" className={cn("flex w-full flex-col gap-1.5", className)} {...props} />
  )
}

function EditableContext({ ...props }: React.ComponentProps<typeof EditablePrimitive.Context>) {
  return <EditablePrimitive.Context {...props} />
}

function EditableLabel({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Label>) {
  return (
    <EditablePrimitive.Label
      data-slot="editable-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function EditableArea({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Area>) {
  return <EditablePrimitive.Area data-slot="editable-area" className={cn("relative w-full", className)} {...props} />
}

function EditablePreview({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Preview>) {
  return (
    <EditablePrimitive.Preview
      data-slot="editable-preview"
      className={cn(
        "inline-flex h-8 w-full items-center rounded-lg px-2.5 text-sm transition-colors hover:bg-muted data-placeholder-shown:text-muted-foreground data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function EditableInput({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Input>) {
  return (
    <EditablePrimitive.Input
      data-slot="editable-input"
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function EditableControl({ className, ...props }: React.ComponentProps<typeof EditablePrimitive.Control>) {
  return (
    <EditablePrimitive.Control
      data-slot="editable-control"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function EditableEditTrigger({ ...props }: React.ComponentProps<typeof EditablePrimitive.EditTrigger>) {
  return <EditablePrimitive.EditTrigger data-slot="editable-edit-trigger" {...props} />
}

function EditableSubmitTrigger({ ...props }: React.ComponentProps<typeof EditablePrimitive.SubmitTrigger>) {
  return <EditablePrimitive.SubmitTrigger data-slot="editable-submit-trigger" {...props} />
}

function EditableCancelTrigger({ ...props }: React.ComponentProps<typeof EditablePrimitive.CancelTrigger>) {
  return <EditablePrimitive.CancelTrigger data-slot="editable-cancel-trigger" {...props} />
}

export {
  Editable,
  EditableArea,
  EditableCancelTrigger,
  EditableContext,
  EditableControl,
  EditableEditTrigger,
  EditableInput,
  EditableLabel,
  EditablePreview,
  EditableSubmitTrigger,
}
