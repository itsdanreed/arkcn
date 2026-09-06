"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slider as SliderPrimitive } from "@ark-ui/react"

function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none flex-col gap-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto",
        className
      )}
      {...props}
    >
      {children}
      <SliderControl>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderThumb key={index} index={index}>
            <SliderHiddenInput />
          </SliderThumb>
        ))}
      </SliderControl>
    </SliderPrimitive.Root>
  )
}

function SliderRoot({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
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

function SliderContext({ ...props }: React.ComponentProps<typeof SliderPrimitive.Context>) {
  return <SliderPrimitive.Context {...props} />
}

function SliderLabel({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Label>) {
  return <SliderPrimitive.Label data-slot="slider-label" className={cn("text-sm font-medium", className)} {...props} />
}

function SliderValueText({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.ValueText>) {
  return (
    <SliderPrimitive.ValueText
      data-slot="slider-value-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SliderControl({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Control>) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn("relative flex items-center data-vertical:h-full data-vertical:flex-col", className)}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Track>) {
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

function SliderRange({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Range>) {
  return (
    <SliderPrimitive.Range
      data-slot="slider-range"
      className={cn("absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full", className)}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function SliderThumb({ className, ...props }: Omit<React.ComponentProps<typeof SliderPrimitive.Thumb>, "id">) {
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
function SliderHiddenInput({ ...props }: Omit<React.ComponentProps<typeof SliderPrimitive.HiddenInput>, "id">) {
  return <SliderPrimitive.HiddenInput {...props} />
}

function SliderMarkerGroup({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.MarkerGroup>) {
  return (
    <SliderPrimitive.MarkerGroup
      data-slot="slider-marker-group"
      className={cn("relative h-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SliderMarker({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Marker>) {
  return (
    <SliderPrimitive.Marker
      data-slot="slider-marker"
      className={cn("absolute -translate-x-1/2", className)}
      {...props}
    />
  )
}

/** Value bubble shown above a thumb while it is dragged. Place it inside `SliderThumb`. */
function SliderDraggingIndicator({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.DraggingIndicator>) {
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

export {
  Slider,
  SliderContext,
  SliderControl,
  SliderHiddenInput,
  SliderLabel,
  SliderMarker,
  SliderMarkerGroup,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValueText,
  SliderDraggingIndicator,
}
