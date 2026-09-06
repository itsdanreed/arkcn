import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox as CheckboxPrimitive } from "@ark-ui/react"
import { CheckIcon, MinusIcon } from "lucide-react"

const checkboxControlClassName =
  "relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-invalid:data-checked:border-primary dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary"

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function Checkbox({ className, children, ...props }: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "id">) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className="group/checkbox peer inline-flex items-center gap-2"
      {...props}
    >
      <CheckboxControl className={className}>
        <CheckboxIndicator>
          <CheckIcon />
        </CheckboxIndicator>
        <CheckboxIndicator indeterminate>
          <MinusIcon />
        </CheckboxIndicator>
      </CheckboxControl>
      {children && <CheckboxLabel>{children}</CheckboxLabel>}
      <CheckboxHiddenInput />
    </CheckboxPrimitive.Root>
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function CheckboxRoot({ ...props }: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "id">) {
  return <CheckboxPrimitive.Root data-slot="checkbox" {...props} />
}

function CheckboxContext({ ...props }: React.ComponentProps<typeof CheckboxPrimitive.Context>) {
  return <CheckboxPrimitive.Context {...props} />
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function CheckboxControl({ className, ...props }: Omit<React.ComponentProps<typeof CheckboxPrimitive.Control>, "id">) {
  return (
    <CheckboxPrimitive.Control
      data-slot="checkbox-control"
      className={cn(checkboxControlClassName, className)}
      {...props}
    />
  )
}

function CheckboxIndicator({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Indicator>) {
  return (
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className={cn("grid place-content-center text-current transition-none [&>svg]:size-3.5", className)}
      {...props}
    />
  )
}

function CheckboxLabel({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Label>) {
  return (
    <CheckboxPrimitive.Label
      data-slot="checkbox-label"
      className={cn("text-sm leading-none select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function CheckboxHiddenInput({ ...props }: Omit<React.ComponentProps<typeof CheckboxPrimitive.HiddenInput>, "id">) {
  return <CheckboxPrimitive.HiddenInput {...props} />
}

function CheckboxGroup({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Group>) {
  return <CheckboxPrimitive.Group data-slot="checkbox-group" className={cn("grid gap-2", className)} {...props} />
}

function CheckboxGroupProvider({ ...props }: React.ComponentProps<typeof CheckboxPrimitive.GroupProvider>) {
  return <CheckboxPrimitive.GroupProvider {...props} />
}

export {
  Checkbox,
  CheckboxContext,
  CheckboxControl,
  CheckboxGroup,
  CheckboxHiddenInput,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxRoot,
  CheckboxGroupProvider,
}
