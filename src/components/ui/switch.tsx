"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "@ark-ui/react"

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function Switch({
  className,
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id"> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className="group/switch peer inline-flex items-center gap-2"
      {...props}
    >
      <SwitchControl className={className}>
        <SwitchThumb />
      </SwitchControl>
      {children && <SwitchLabel>{children}</SwitchLabel>}
      <SwitchHiddenInput />
    </SwitchPrimitive.Root>
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SwitchRoot({ ...props }: Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id">) {
  return <SwitchPrimitive.Root data-slot="switch" {...props} />
}

function SwitchContext({ ...props }: React.ComponentProps<typeof SwitchPrimitive.Context>) {
  return <SwitchPrimitive.Context {...props} />
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SwitchControl({ className, ...props }: Omit<React.ComponentProps<typeof SwitchPrimitive.Control>, "id">) {
  return (
    <SwitchPrimitive.Control
      data-slot="switch-control"
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-focus-visible/field-label:border-transparent group-has-focus-visible/field-label:ring-0 group-data-[size=default]/switch:h-[18.4px] group-data-[size=default]/switch:w-8 group-data-[size=sm]/switch:h-3.5 group-data-[size=sm]/switch:w-6 after:absolute after:-inset-x-3 after:-inset-y-2 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function SwitchThumb({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Thumb>) {
  return (
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground",
        className
      )}
      {...props}
    />
  )
}

function SwitchLabel({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Label>) {
  return (
    <SwitchPrimitive.Label
      data-slot="switch-label"
      className={cn("text-sm leading-none select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SwitchHiddenInput({ ...props }: Omit<React.ComponentProps<typeof SwitchPrimitive.HiddenInput>, "id">) {
  return <SwitchPrimitive.HiddenInput {...props} />
}

export { Switch, SwitchContext, SwitchControl, SwitchHiddenInput, SwitchLabel, SwitchRoot, SwitchThumb }
