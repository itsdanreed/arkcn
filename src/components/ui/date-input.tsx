"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DateInput as DateInputPrimitive } from "@ark-ui/react"

function DateInput({ className, children, ...props }: React.ComponentProps<typeof DateInputPrimitive.Root>) {
  return (
    <DateInputPrimitive.Root
      data-slot="date-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {children ?? (
        <DateInputControl>
          <DateInputSegmentGroup />
          <DateInputHiddenInput />
        </DateInputControl>
      )}
    </DateInputPrimitive.Root>
  )
}

function DateInputContext({ ...props }: React.ComponentProps<typeof DateInputPrimitive.Context>) {
  return <DateInputPrimitive.Context {...props} />
}

function DateInputLabel({ className, ...props }: React.ComponentProps<typeof DateInputPrimitive.Label>) {
  return (
    <DateInputPrimitive.Label
      data-slot="date-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function DateInputControl({ className, ...props }: React.ComponentProps<typeof DateInputPrimitive.Control>) {
  return (
    <DateInputPrimitive.Control
      data-slot="date-input-control"
      className={cn(
        "flex h-8 w-fit items-center rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DateInputSegmentGroup({
  className,
  children,
  index = 0,
  ...props
}: React.ComponentProps<typeof DateInputPrimitive.SegmentGroup>) {
  return (
    <DateInputPrimitive.SegmentGroup
      data-slot="date-input-segment-group"
      index={index}
      className={cn("flex items-center", className)}
      {...props}
    >
      {children ?? (
        <DateInputPrimitive.Context>
          {(api) => api.getSegments({ index }).map((segment, i) => <DateInputSegment key={i} segment={segment} />)}
        </DateInputPrimitive.Context>
      )}
    </DateInputPrimitive.SegmentGroup>
  )
}

function DateInputSegment({ className, ...props }: React.ComponentProps<typeof DateInputPrimitive.Segment>) {
  return (
    <DateInputPrimitive.Segment
      data-slot="date-input-segment"
      className={cn(
        "rounded-sm px-0.5 tabular-nums outline-none data-editable:focus:bg-primary data-editable:focus:text-primary-foreground data-placeholder-shown:text-muted-foreground data-[type=literal]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DateInputSegmentContext({ ...props }: React.ComponentProps<typeof DateInputPrimitive.SegmentContext>) {
  return <DateInputPrimitive.SegmentContext {...props} />
}

function DateInputHiddenInput({ ...props }: React.ComponentProps<typeof DateInputPrimitive.HiddenInput>) {
  return <DateInputPrimitive.HiddenInput {...props} />
}

export {
  DateInput,
  DateInputContext,
  DateInputControl,
  DateInputHiddenInput,
  DateInputLabel,
  DateInputSegment,
  DateInputSegmentContext,
  DateInputSegmentGroup,
}
