"use client"
import * as React from "react"
import { Fieldset as FieldsetPrimitive, useFieldset, useFieldsetContext } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function FieldsetContext(props: FieldsetContextProps) {
  return <FieldsetPrimitive.Context {...props} />
}

function FieldsetErrorText({ className, ...props }: FieldsetErrorTextProps) {
  return (
    <FieldsetPrimitive.ErrorText
      data-slot="fieldset-error-text"
      className={cn("text-sm text-destructive", className)}
      {...props}
    />
  )
}

function FieldsetHelperText({ className, ...props }: FieldsetHelperTextProps) {
  return (
    <FieldsetPrimitive.HelperText
      data-slot="fieldset-helper-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      className={cn("text-sm font-medium data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function FieldsetRoot({ className, ...props }: FieldsetRootProps) {
  return (
    <FieldsetPrimitive.Root data-slot="fieldset" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
  )
}

function FieldsetRootProvider({ className, ...props }: FieldsetRootProviderProps) {
  return (
    <FieldsetPrimitive.RootProvider
      data-slot="fieldset-root-provider"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  )
}

type FieldsetRootProps = React.ComponentProps<typeof FieldsetPrimitive.Root>

type FieldsetContextProps = React.ComponentProps<typeof FieldsetPrimitive.Context>

type FieldsetErrorTextProps = React.ComponentProps<typeof FieldsetPrimitive.ErrorText>

type FieldsetHelperTextProps = React.ComponentProps<typeof FieldsetPrimitive.HelperText>

type FieldsetLegendProps = React.ComponentProps<typeof FieldsetPrimitive.Legend>

type FieldsetRootProviderProps = React.ComponentProps<typeof FieldsetPrimitive.RootProvider>

const Fieldset = {
  Root: FieldsetRoot,
  Context: FieldsetContext,
  ErrorText: FieldsetErrorText,
  HelperText: FieldsetHelperText,
  Legend: FieldsetLegend,
  RootProvider: FieldsetRootProvider,
}

export {
  Fieldset,
  useFieldset,
  useFieldsetContext,
  type FieldsetRootProps,
  type FieldsetContextProps,
  type FieldsetErrorTextProps,
  type FieldsetHelperTextProps,
  type FieldsetLegendProps,
  type FieldsetRootProviderProps,
}
