"use client"

import { useSlider, useSliderContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Slider as SliderPrimitive } from "@ark-ui/react"

function SliderRoot({ className, ...props }: SliderRootProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none flex-col gap-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto",
        className
      )}
      {...props}
    />
  )
}

function SliderContext({ ...props }: SliderContextProps) {
  return <SliderPrimitive.Context {...props} />
}

function SliderLabel({ className, ...props }: SliderLabelProps) {
  return <SliderPrimitive.Label data-slot="slider-label" className={cn("text-sm font-medium", className)} {...props} />
}

function SliderValueText({ className, ...props }: SliderValueTextProps) {
  return (
    <SliderPrimitive.ValueText
      data-slot="slider-value-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SliderControl({ className, ...props }: SliderControlProps) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn("relative flex items-center data-vertical:h-full data-vertical:flex-col", className)}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn(
        "relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
        className
      )}
      {...props}
    />
  )
}

function SliderRange({ className, ...props }: SliderRangeProps) {
  return (
    <SliderPrimitive.Range
      data-slot="slider-range"
      className={cn("absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden data-dragging:ring-3 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SliderHiddenInput({ ...props }: SliderHiddenInputProps) {
  return <SliderPrimitive.HiddenInput {...props} />
}

function SliderMarkerGroup({ className, ...props }: SliderMarkerGroupProps) {
  return (
    <SliderPrimitive.MarkerGroup
      data-slot="slider-marker-group"
      className={cn("relative h-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SliderMarker({ className, ...props }: SliderMarkerProps) {
  return (
    <SliderPrimitive.Marker
      data-slot="slider-marker"
      className={cn("absolute -translate-x-1/2", className)}
      {...props}
    />
  )
}

/** Value bubble shown above a thumb while it is dragged. Place it inside `SliderThumb`. */
function SliderDraggingIndicator({ className, ...props }: SliderDraggingIndicatorProps) {
  return (
    <SliderPrimitive.DraggingIndicator
      data-slot="slider-dragging-indicator"
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function SliderRootProvider({ className, ...props }: SliderRootProviderProps) {
  return (
    <SliderPrimitive.RootProvider
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none flex-col gap-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto",
        className
      )}
      {...props}
    />
  )
}

type SliderRootProps = React.ComponentProps<typeof SliderPrimitive.Root>

type SliderRootProviderProps = React.ComponentProps<typeof SliderPrimitive.RootProvider>

type SliderContextProps = React.ComponentProps<typeof SliderPrimitive.Context>

type SliderControlProps = React.ComponentProps<typeof SliderPrimitive.Control>

type SliderHiddenInputProps = Omit<React.ComponentProps<typeof SliderPrimitive.HiddenInput>, "id">

type SliderLabelProps = React.ComponentProps<typeof SliderPrimitive.Label>

type SliderMarkerProps = React.ComponentProps<typeof SliderPrimitive.Marker>

type SliderMarkerGroupProps = React.ComponentProps<typeof SliderPrimitive.MarkerGroup>

type SliderRangeProps = React.ComponentProps<typeof SliderPrimitive.Range>

type SliderThumbProps = Omit<React.ComponentProps<typeof SliderPrimitive.Thumb>, "id">

type SliderTrackProps = React.ComponentProps<typeof SliderPrimitive.Track>

type SliderValueTextProps = React.ComponentProps<typeof SliderPrimitive.ValueText>

type SliderDraggingIndicatorProps = React.ComponentProps<typeof SliderPrimitive.DraggingIndicator>

const Slider = {
  Root: SliderRoot,
  RootProvider: SliderRootProvider,
  Context: SliderContext,
  Control: SliderControl,
  HiddenInput: SliderHiddenInput,
  Label: SliderLabel,
  Marker: SliderMarker,
  MarkerGroup: SliderMarkerGroup,
  Range: SliderRange,
  Thumb: SliderThumb,
  Track: SliderTrack,
  ValueText: SliderValueText,
  DraggingIndicator: SliderDraggingIndicator,
}

export {
  useSlider,
  useSliderContext,
  Slider,
  type SliderRootProps,
  type SliderRootProviderProps,
  type SliderContextProps,
  type SliderControlProps,
  type SliderHiddenInputProps,
  type SliderLabelProps,
  type SliderMarkerProps,
  type SliderMarkerGroupProps,
  type SliderRangeProps,
  type SliderThumbProps,
  type SliderTrackProps,
  type SliderValueTextProps,
  type SliderDraggingIndicatorProps,
}
