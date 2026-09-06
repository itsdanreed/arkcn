"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AngleSlider as AngleSliderPrimitive } from "@ark-ui/react"

function AngleSlider({ className, children, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Root>) {
  return (
    <AngleSliderPrimitive.Root
      data-slot="angle-slider"
      className={cn("inline-flex flex-col items-center gap-2", className)}
      {...props}
    >
      {children ?? (
        <>
          <AngleSliderControl>
            <AngleSliderThumb />
          </AngleSliderControl>
          <AngleSliderValueText />
          <AngleSliderHiddenInput />
        </>
      )}
    </AngleSliderPrimitive.Root>
  )
}

function AngleSliderContext({ ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Context>) {
  return <AngleSliderPrimitive.Context {...props} />
}

function AngleSliderLabel({ className, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Label>) {
  return (
    <AngleSliderPrimitive.Label
      data-slot="angle-slider-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function AngleSliderControl({ className, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Control>) {
  return (
    <AngleSliderPrimitive.Control
      data-slot="angle-slider-control"
      className={cn(
        "relative size-24 rounded-full border border-input bg-muted/50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function AngleSliderThumb({ className, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Thumb>) {
  return (
    <AngleSliderPrimitive.Thumb
      data-slot="angle-slider-thumb"
      className={cn(
        "absolute inset-0 m-auto h-full w-0.5 origin-center rotate-(--angle) after:absolute after:top-1 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rounded-full after:border after:border-ring after:bg-white",
        className
      )}
      {...props}
    />
  )
}

function AngleSliderMarkerGroup({
  className,
  ...props
}: React.ComponentProps<typeof AngleSliderPrimitive.MarkerGroup>) {
  return (
    <AngleSliderPrimitive.MarkerGroup
      data-slot="angle-slider-marker-group"
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    />
  )
}

function AngleSliderMarker({ className, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.Marker>) {
  return (
    <AngleSliderPrimitive.Marker
      data-slot="angle-slider-marker"
      className={cn(
        "absolute inset-0 m-auto h-full w-px origin-center rotate-(--marker-value) before:absolute before:top-0 before:left-0 before:h-1.5 before:w-px before:bg-border data-[state=under-value]:before:bg-primary",
        className
      )}
      {...props}
    />
  )
}

function AngleSliderValueText({ className, ...props }: React.ComponentProps<typeof AngleSliderPrimitive.ValueText>) {
  return (
    <AngleSliderPrimitive.ValueText
      data-slot="angle-slider-value-text"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

function AngleSliderHiddenInput({ ...props }: React.ComponentProps<typeof AngleSliderPrimitive.HiddenInput>) {
  return <AngleSliderPrimitive.HiddenInput {...props} />
}

export {
  AngleSlider,
  AngleSliderContext,
  AngleSliderControl,
  AngleSliderHiddenInput,
  AngleSliderLabel,
  AngleSliderMarker,
  AngleSliderMarkerGroup,
  AngleSliderThumb,
  AngleSliderValueText,
}
