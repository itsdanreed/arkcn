import { useRadioGroup, useRadioGroupContext, useRadioGroupItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { RadioGroup as RadioGroupPrimitive } from "@ark-ui/react"

function RadioGroupRoot({ className, ...props }: RadioGroupRootProps) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid w-full gap-2", className)} {...props} />
}

function RadioGroupContext({ ...props }: RadioGroupContextProps) {
  return <RadioGroupPrimitive.Context {...props} />
}

function RadioGroupLabel({ className, ...props }: RadioGroupLabelProps) {
  return (
    <RadioGroupPrimitive.Label
      data-slot="radio-group-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
  return (
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      className={cn("rounded-md bg-background shadow-sm", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function RadioGroupItem({ className, children, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className="group/radio-group-item peer inline-flex items-center gap-2"
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <RadioGroupItemControl className={className} />
          {children && <RadioGroupItemText>{children}</RadioGroupItemText>}
          <RadioGroupItemHiddenInput />
        </>
      )}
    </RadioGroupPrimitive.Item>
  )
}

function RadioGroupItemContext({ ...props }: RadioGroupItemContextProps) {
  return <RadioGroupPrimitive.ItemContext {...props} />
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function RadioGroupItemControl({ className, children, ...props }: RadioGroupItemControlProps) {
  return (
    <RadioGroupPrimitive.ItemControl
      data-slot="radio-group-item-control"
      className={cn(
        "group/radio-group-item-control relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none group-has-focus-visible/field-label:ring-0 group-has-focus-visible/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-focus-visible/field-label:data-checked:border-primary data-invalid:data-checked:border-primary dark:data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
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
          {children ?? (
            <span
              data-slot="radio-group-indicator"
              className="absolute top-1/2 left-1/2 hidden size-2 -translate-1/2 rounded-full bg-primary-foreground group-data-checked/radio-group-item-control:block"
            />
          )}
        </>
      )}
    </RadioGroupPrimitive.ItemControl>
  )
}

function RadioGroupItemText({ className, ...props }: RadioGroupItemTextProps) {
  return (
    <RadioGroupPrimitive.ItemText
      data-slot="radio-group-item-text"
      className={cn("text-sm leading-none select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function RadioGroupItemHiddenInput({ ...props }: RadioGroupItemHiddenInputProps) {
  return <RadioGroupPrimitive.ItemHiddenInput {...props} />
}

function RadioGroupRootProvider({ className, ...props }: RadioGroupRootProviderProps) {
  return (
    <RadioGroupPrimitive.RootProvider
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

type RadioGroupRootProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>

type RadioGroupRootProviderProps = React.ComponentProps<typeof RadioGroupPrimitive.RootProvider>

type RadioGroupContextProps = React.ComponentProps<typeof RadioGroupPrimitive.Context>

type RadioGroupIndicatorProps = React.ComponentProps<typeof RadioGroupPrimitive.Indicator>

type RadioGroupItemProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "id">

type RadioGroupItemContextProps = React.ComponentProps<typeof RadioGroupPrimitive.ItemContext>

type RadioGroupItemControlProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.ItemControl>, "id">

type RadioGroupItemHiddenInputProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.ItemHiddenInput>, "id">

type RadioGroupItemTextProps = React.ComponentProps<typeof RadioGroupPrimitive.ItemText>

type RadioGroupLabelProps = React.ComponentProps<typeof RadioGroupPrimitive.Label>

const RadioGroup = {
  Root: RadioGroupRoot,
  RootProvider: RadioGroupRootProvider,
  Context: RadioGroupContext,
  Indicator: RadioGroupIndicator,
  Item: RadioGroupItem,
  ItemContext: RadioGroupItemContext,
  ItemControl: RadioGroupItemControl,
  ItemHiddenInput: RadioGroupItemHiddenInput,
  ItemText: RadioGroupItemText,
  Label: RadioGroupLabel,
}

export {
  useRadioGroup,
  useRadioGroupContext,
  useRadioGroupItemContext,
  RadioGroup,
  type RadioGroupRootProps,
  type RadioGroupRootProviderProps,
  type RadioGroupContextProps,
  type RadioGroupIndicatorProps,
  type RadioGroupItemProps,
  type RadioGroupItemContextProps,
  type RadioGroupItemControlProps,
  type RadioGroupItemHiddenInputProps,
  type RadioGroupItemTextProps,
  type RadioGroupLabelProps,
}
