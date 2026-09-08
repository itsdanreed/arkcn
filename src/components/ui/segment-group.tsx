"use client"

import { useSegmentGroup, useSegmentGroupContext, useSegmentGroupItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { SegmentGroup as SegmentGroupPrimitive } from "@ark-ui/react"

function SegmentGroupRoot({ className, orientation = "horizontal", ...props }: SegmentGroupRootProps) {
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

function SegmentGroupContext({ ...props }: SegmentGroupContextProps) {
  return <SegmentGroupPrimitive.Context {...props} />
}

function SegmentGroupLabel({ className, ...props }: SegmentGroupLabelProps) {
  return (
    <SegmentGroupPrimitive.Label
      data-slot="segment-group-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function SegmentGroupIndicator({ className, ...props }: SegmentGroupIndicatorProps) {
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

function SegmentGroupItem({ className, children, ...props }: SegmentGroupItemProps) {
  return (
    <SegmentGroupPrimitive.Item
      data-slot="segment-group-item"
      className={cn(
        "relative z-10 inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors select-none hover:text-foreground data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
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
          <SegmentGroupItemText>{children}</SegmentGroupItemText>
          <SegmentGroupItemControl />
          <SegmentGroupItemHiddenInput />
        </>
      )}
    </SegmentGroupPrimitive.Item>
  )
}

function SegmentGroupItemContext({ ...props }: SegmentGroupItemContextProps) {
  return <SegmentGroupPrimitive.ItemContext {...props} />
}

function SegmentGroupItemText({ ...props }: SegmentGroupItemTextProps) {
  return <SegmentGroupPrimitive.ItemText data-slot="segment-group-item-text" {...props} />
}

function SegmentGroupItemControl({ ...props }: SegmentGroupItemControlProps) {
  return <SegmentGroupPrimitive.ItemControl data-slot="segment-group-item-control" {...props} />
}

function SegmentGroupItemHiddenInput({ ...props }: SegmentGroupItemHiddenInputProps) {
  return <SegmentGroupPrimitive.ItemHiddenInput {...props} />
}

function SegmentGroupRootProvider({ className, ...props }: SegmentGroupRootProviderProps) {
  return (
    <SegmentGroupPrimitive.RootProvider
      data-slot="segment-group"
      className={cn(
        "relative inline-flex h-8 w-fit items-center gap-0.5 rounded-lg bg-muted p-0.75 text-muted-foreground data-vertical:h-auto data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

type SegmentGroupRootProps = React.ComponentProps<typeof SegmentGroupPrimitive.Root>

type SegmentGroupRootProviderProps = React.ComponentProps<typeof SegmentGroupPrimitive.RootProvider>

type SegmentGroupContextProps = React.ComponentProps<typeof SegmentGroupPrimitive.Context>

type SegmentGroupIndicatorProps = React.ComponentProps<typeof SegmentGroupPrimitive.Indicator>

type SegmentGroupItemProps = React.ComponentProps<typeof SegmentGroupPrimitive.Item>

type SegmentGroupItemContextProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemContext>

type SegmentGroupItemControlProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemControl>

type SegmentGroupItemHiddenInputProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemHiddenInput>

type SegmentGroupItemTextProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemText>

type SegmentGroupLabelProps = React.ComponentProps<typeof SegmentGroupPrimitive.Label>

const SegmentGroup = {
  Root: SegmentGroupRoot,
  RootProvider: SegmentGroupRootProvider,
  Context: SegmentGroupContext,
  Indicator: SegmentGroupIndicator,
  Item: SegmentGroupItem,
  ItemContext: SegmentGroupItemContext,
  ItemControl: SegmentGroupItemControl,
  ItemHiddenInput: SegmentGroupItemHiddenInput,
  ItemText: SegmentGroupItemText,
  Label: SegmentGroupLabel,
}

export {
  useSegmentGroup,
  useSegmentGroupContext,
  useSegmentGroupItemContext,
  SegmentGroup,
  type SegmentGroupRootProps,
  type SegmentGroupRootProviderProps,
  type SegmentGroupContextProps,
  type SegmentGroupIndicatorProps,
  type SegmentGroupItemProps,
  type SegmentGroupItemContextProps,
  type SegmentGroupItemControlProps,
  type SegmentGroupItemHiddenInputProps,
  type SegmentGroupItemTextProps,
  type SegmentGroupLabelProps,
}
