"use client"

import { useEditable, useEditableContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Editable as EditablePrimitive } from "@ark-ui/react"

function EditableRoot({ className, ...props }: EditableRootProps) {
  return (
    <EditablePrimitive.Root data-slot="editable" className={cn("flex w-full flex-col gap-1.5", className)} {...props} />
  )
}

function EditableContext({ ...props }: EditableContextProps) {
  return <EditablePrimitive.Context {...props} />
}

function EditableLabel({ className, ...props }: EditableLabelProps) {
  return (
    <EditablePrimitive.Label
      data-slot="editable-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function EditableArea({ className, ...props }: EditableAreaProps) {
  return <EditablePrimitive.Area data-slot="editable-area" className={cn("relative w-full", className)} {...props} />
}

function EditablePreview({ className, ...props }: EditablePreviewProps) {
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

function EditableInput({ className, ...props }: EditableInputProps) {
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

function EditableControl({ className, ...props }: EditableControlProps) {
  return (
    <EditablePrimitive.Control
      data-slot="editable-control"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function EditableEditTrigger({ ...props }: EditableEditTriggerProps) {
  return <EditablePrimitive.EditTrigger data-slot="editable-edit-trigger" {...props} />
}

function EditableSubmitTrigger({ ...props }: EditableSubmitTriggerProps) {
  return <EditablePrimitive.SubmitTrigger data-slot="editable-submit-trigger" {...props} />
}

function EditableCancelTrigger({ ...props }: EditableCancelTriggerProps) {
  return <EditablePrimitive.CancelTrigger data-slot="editable-cancel-trigger" {...props} />
}

function EditableRootProvider({ className, ...props }: EditableRootProviderProps) {
  return (
    <EditablePrimitive.RootProvider
      data-slot="editable"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type EditableRootProps = React.ComponentProps<typeof EditablePrimitive.Root>

type EditableRootProviderProps = React.ComponentProps<typeof EditablePrimitive.RootProvider>

type EditableAreaProps = React.ComponentProps<typeof EditablePrimitive.Area>

type EditableCancelTriggerProps = React.ComponentProps<typeof EditablePrimitive.CancelTrigger>

type EditableContextProps = React.ComponentProps<typeof EditablePrimitive.Context>

type EditableControlProps = React.ComponentProps<typeof EditablePrimitive.Control>

type EditableEditTriggerProps = React.ComponentProps<typeof EditablePrimitive.EditTrigger>

type EditableInputProps = React.ComponentProps<typeof EditablePrimitive.Input>

type EditableLabelProps = React.ComponentProps<typeof EditablePrimitive.Label>

type EditablePreviewProps = React.ComponentProps<typeof EditablePrimitive.Preview>

type EditableSubmitTriggerProps = React.ComponentProps<typeof EditablePrimitive.SubmitTrigger>

const Editable = {
  Root: EditableRoot,
  RootProvider: EditableRootProvider,
  Area: EditableArea,
  CancelTrigger: EditableCancelTrigger,
  Context: EditableContext,
  Control: EditableControl,
  EditTrigger: EditableEditTrigger,
  Input: EditableInput,
  Label: EditableLabel,
  Preview: EditablePreview,
  SubmitTrigger: EditableSubmitTrigger,
}

export {
  useEditable,
  useEditableContext,
  Editable,
  type EditableRootProps,
  type EditableRootProviderProps,
  type EditableAreaProps,
  type EditableCancelTriggerProps,
  type EditableContextProps,
  type EditableControlProps,
  type EditableEditTriggerProps,
  type EditableInputProps,
  type EditableLabelProps,
  type EditablePreviewProps,
  type EditableSubmitTriggerProps,
}
