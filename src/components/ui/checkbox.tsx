import { useCheckbox, useCheckboxContext, useCheckboxGroup, useCheckboxGroupContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox as CheckboxPrimitive } from "@ark-ui/react"

const checkboxControlClassName =
  "relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-invalid:data-checked:border-primary dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary"

function CheckboxRoot({ className, ...props }: CheckboxRootProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn("group/checkbox peer inline-flex items-center gap-2", className)}
      {...props}
    />
  )
}

function CheckboxContext({ ...props }: CheckboxContextProps) {
  return <CheckboxPrimitive.Context {...props} />
}

function CheckboxControl({ className, ...props }: CheckboxControlProps) {
  return (
    <CheckboxPrimitive.Control
      data-slot="checkbox-control"
      className={cn(checkboxControlClassName, className)}
      {...props}
    />
  )
}

function CheckboxIndicator({ className, ...props }: CheckboxIndicatorProps) {
  return (
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className={cn("grid place-content-center text-current transition-none [&>svg]:size-3.5", className)}
      {...props}
    />
  )
}

function CheckboxLabel({ className, ...props }: CheckboxLabelProps) {
  return (
    <CheckboxPrimitive.Label
      data-slot="checkbox-label"
      className={cn("text-sm leading-none select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function CheckboxHiddenInput({ ...props }: CheckboxHiddenInputProps) {
  return <CheckboxPrimitive.HiddenInput {...props} />
}

function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return <CheckboxPrimitive.Group data-slot="checkbox-group" className={cn("grid gap-2", className)} {...props} />
}

function CheckboxGroupProvider({ ...props }: CheckboxGroupProviderProps) {
  return <CheckboxPrimitive.GroupProvider {...props} />
}

function CheckboxRootProvider({ className, ...props }: CheckboxRootProviderProps) {
  return (
    <CheckboxPrimitive.RootProvider
      data-slot="checkbox"
      className={cn("group/checkbox peer inline-flex items-center gap-2", className)}
      {...props}
    />
  )
}

type CheckboxRootProps = React.ComponentProps<typeof CheckboxPrimitive.Root>

type CheckboxRootProviderProps = React.ComponentProps<typeof CheckboxPrimitive.RootProvider>

type CheckboxContextProps = React.ComponentProps<typeof CheckboxPrimitive.Context>

type CheckboxControlProps = React.ComponentProps<typeof CheckboxPrimitive.Control>

type CheckboxGroupProps = React.ComponentProps<typeof CheckboxPrimitive.Group>

type CheckboxHiddenInputProps = React.ComponentProps<typeof CheckboxPrimitive.HiddenInput>

type CheckboxIndicatorProps = React.ComponentProps<typeof CheckboxPrimitive.Indicator>

type CheckboxLabelProps = React.ComponentProps<typeof CheckboxPrimitive.Label>

type CheckboxGroupProviderProps = React.ComponentProps<typeof CheckboxPrimitive.GroupProvider>

const Checkbox = {
  Root: CheckboxRoot,
  RootProvider: CheckboxRootProvider,
  Context: CheckboxContext,
  Control: CheckboxControl,
  Group: CheckboxGroup,
  HiddenInput: CheckboxHiddenInput,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  GroupProvider: CheckboxGroupProvider,
}

export {
  useCheckbox,
  useCheckboxContext,
  useCheckboxGroup,
  useCheckboxGroupContext,
  Checkbox,
  type CheckboxRootProps,
  type CheckboxRootProviderProps,
  type CheckboxContextProps,
  type CheckboxControlProps,
  type CheckboxGroupProps,
  type CheckboxHiddenInputProps,
  type CheckboxIndicatorProps,
  type CheckboxLabelProps,
  type CheckboxGroupProviderProps,
}
