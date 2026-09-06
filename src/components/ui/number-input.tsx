"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { NumberInput as NumberInputPrimitive } from "@ark-ui/react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function NumberInput({ className, children, ...props }: React.ComponentProps<typeof NumberInputPrimitive.Root>) {
  return (
    <NumberInputPrimitive.Root
      data-slot="number-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {children ?? (
        <NumberInputControl>
          <NumberInputInput />
          <NumberInputTriggers />
        </NumberInputControl>
      )}
    </NumberInputPrimitive.Root>
  )
}

function NumberInputContext({ ...props }: React.ComponentProps<typeof NumberInputPrimitive.Context>) {
  return <NumberInputPrimitive.Context {...props} />
}

function NumberInputLabel({ className, ...props }: React.ComponentProps<typeof NumberInputPrimitive.Label>) {
  return (
    <NumberInputPrimitive.Label
      data-slot="number-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function NumberInputControl({ className, ...props }: React.ComponentProps<typeof NumberInputPrimitive.Control>) {
  return (
    <NumberInputPrimitive.Control
      data-slot="number-input-control"
      className={cn(
        "flex h-8 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-transparent transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function NumberInputInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputPrimitive.Input>, "id">) {
  return (
    <NumberInputPrimitive.Input
      data-slot="number-input-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm",
        className
      )}
      {...props}
    />
  )
}

function NumberInputTriggers({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="number-input-triggers"
      className={cn("flex w-6 flex-col border-l border-input", className)}
      {...props}
    >
      <NumberInputIncrementTrigger />
      <NumberInputDecrementTrigger />
    </div>
  )
}

const triggerClassName =
  "flex flex-1 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3"

function NumberInputIncrementTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberInputPrimitive.IncrementTrigger>) {
  return (
    <NumberInputPrimitive.IncrementTrigger
      data-slot="number-input-increment-trigger"
      className={cn(triggerClassName, "border-b border-input", className)}
      {...props}
    >
      {children ?? <ChevronUpIcon />}
    </NumberInputPrimitive.IncrementTrigger>
  )
}

function NumberInputDecrementTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberInputPrimitive.DecrementTrigger>) {
  return (
    <NumberInputPrimitive.DecrementTrigger
      data-slot="number-input-decrement-trigger"
      className={cn(triggerClassName, className)}
      {...props}
    >
      {children ?? <ChevronDownIcon />}
    </NumberInputPrimitive.DecrementTrigger>
  )
}

function NumberInputScrubber({ className, ...props }: React.ComponentProps<typeof NumberInputPrimitive.Scrubber>) {
  return (
    <NumberInputPrimitive.Scrubber
      data-slot="number-input-scrubber"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  )
}

function NumberInputValueText({ className, ...props }: React.ComponentProps<typeof NumberInputPrimitive.ValueText>) {
  return (
    <NumberInputPrimitive.ValueText
      data-slot="number-input-value-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  NumberInput,
  NumberInputContext,
  NumberInputControl,
  NumberInputDecrementTrigger,
  NumberInputIncrementTrigger,
  NumberInputInput,
  NumberInputLabel,
  NumberInputScrubber,
  NumberInputTriggers,
  NumberInputValueText,
}
