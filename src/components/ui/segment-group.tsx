"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SegmentGroup as SegmentGroupPrimitive } from "@ark-ui/react"

function SegmentGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SegmentGroupPrimitive.Root>) {
  return (
    <SegmentGroupPrimitive.Root
      data-slot="segment-group"
      orientation={orientation}
      className={cn(
        "relative inline-flex h-8 w-fit items-center gap-0.5 rounded-lg bg-muted p-0.75 text-muted-foreground data-vertical:h-auto data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

function SegmentGroupContext({ ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.Context>) {
  return <SegmentGroupPrimitive.Context {...props} />
}

function SegmentGroupLabel({ className, ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.Label>) {
  return (
    <SegmentGroupPrimitive.Label
      data-slot="segment-group-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function SegmentGroupIndicator({ className, ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.Indicator>) {
  return (
    <SegmentGroupPrimitive.Indicator
      data-slot="segment-group-indicator"
      className={cn(
        "top-(--top) left-(--left) z-0 h-(--height) w-(--width) rounded-md bg-background shadow-sm transition-[left,top,width,height] duration-200 dark:border dark:border-input dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function SegmentGroupItem({ className, children, ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.Item>) {
  return (
    <SegmentGroupPrimitive.Item
      data-slot="segment-group-item"
      className={cn(
        "relative z-10 inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors select-none hover:text-foreground data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SegmentGroupItemText>{children}</SegmentGroupItemText>
      <SegmentGroupItemControl />
      <SegmentGroupItemHiddenInput />
    </SegmentGroupPrimitive.Item>
  )
}

function SegmentGroupItemContext({ ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.ItemContext>) {
  return <SegmentGroupPrimitive.ItemContext {...props} />
}

function SegmentGroupItemText({ ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.ItemText>) {
  return <SegmentGroupPrimitive.ItemText data-slot="segment-group-item-text" {...props} />
}

function SegmentGroupItemControl({ ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.ItemControl>) {
  return <SegmentGroupPrimitive.ItemControl data-slot="segment-group-item-control" {...props} />
}

function SegmentGroupItemHiddenInput({ ...props }: React.ComponentProps<typeof SegmentGroupPrimitive.ItemHiddenInput>) {
  return <SegmentGroupPrimitive.ItemHiddenInput {...props} />
}

export {
  SegmentGroup,
  SegmentGroupContext,
  SegmentGroupIndicator,
  SegmentGroupItem,
  SegmentGroupItemContext,
  SegmentGroupItemControl,
  SegmentGroupItemHiddenInput,
  SegmentGroupItemText,
  SegmentGroupLabel,
}
