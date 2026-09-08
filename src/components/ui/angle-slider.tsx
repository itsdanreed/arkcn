"use client"

import { useAngleSlider, useAngleSliderContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { AngleSlider as AngleSliderPrimitive } from "@ark-ui/react"

function AngleSliderRoot({ className, children, ...props }: AngleSliderRootProps) {
  return (
    <AngleSliderPrimitive.Root
      data-slot="angle-slider"
      className={cn("inline-flex flex-col items-center gap-2", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <>
              <AngleSliderControl>
                <AngleSliderThumb />
              </AngleSliderControl>
              <AngleSliderValueText />
              <AngleSliderHiddenInput />
            </>
          )}
        </>
      )}
    </AngleSliderPrimitive.Root>
  )
}

function AngleSliderContext({ ...props }: AngleSliderContextProps) {
  return <AngleSliderPrimitive.Context {...props} />
}

function AngleSliderLabel({ className, ...props }: AngleSliderLabelProps) {
  return (
    <AngleSliderPrimitive.Label
      data-slot="angle-slider-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function AngleSliderControl({ className, ...props }: AngleSliderControlProps) {
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

function AngleSliderThumb({ className, ...props }: AngleSliderThumbProps) {
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

function AngleSliderMarkerGroup({ className, ...props }: AngleSliderMarkerGroupProps) {
  return (
    <AngleSliderPrimitive.MarkerGroup
      data-slot="angle-slider-marker-group"
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    />
  )
}

function AngleSliderMarker({ className, ...props }: AngleSliderMarkerProps) {
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

function AngleSliderValueText({ className, ...props }: AngleSliderValueTextProps) {
  return (
    <AngleSliderPrimitive.ValueText
      data-slot="angle-slider-value-text"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

function AngleSliderHiddenInput({ ...props }: AngleSliderHiddenInputProps) {
  return <AngleSliderPrimitive.HiddenInput {...props} />
}

function AngleSliderRootProvider({ className, ...props }: AngleSliderRootProviderProps) {
  return (
    <AngleSliderPrimitive.RootProvider
      data-slot="angle-slider"
      className={cn("inline-flex flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

type AngleSliderRootProps = React.ComponentProps<typeof AngleSliderPrimitive.Root>

type AngleSliderRootProviderProps = React.ComponentProps<typeof AngleSliderPrimitive.RootProvider>

type AngleSliderContextProps = React.ComponentProps<typeof AngleSliderPrimitive.Context>

type AngleSliderControlProps = React.ComponentProps<typeof AngleSliderPrimitive.Control>

type AngleSliderHiddenInputProps = React.ComponentProps<typeof AngleSliderPrimitive.HiddenInput>

type AngleSliderLabelProps = React.ComponentProps<typeof AngleSliderPrimitive.Label>

type AngleSliderMarkerProps = React.ComponentProps<typeof AngleSliderPrimitive.Marker>

type AngleSliderMarkerGroupProps = React.ComponentProps<typeof AngleSliderPrimitive.MarkerGroup>

type AngleSliderThumbProps = React.ComponentProps<typeof AngleSliderPrimitive.Thumb>

type AngleSliderValueTextProps = React.ComponentProps<typeof AngleSliderPrimitive.ValueText>

const AngleSlider = {
  Root: AngleSliderRoot,
  RootProvider: AngleSliderRootProvider,
  Context: AngleSliderContext,
  Control: AngleSliderControl,
  HiddenInput: AngleSliderHiddenInput,
  Label: AngleSliderLabel,
  Marker: AngleSliderMarker,
  MarkerGroup: AngleSliderMarkerGroup,
  Thumb: AngleSliderThumb,
  ValueText: AngleSliderValueText,
}

export {
  useAngleSlider,
  useAngleSliderContext,
  AngleSlider,
  type AngleSliderRootProps,
  type AngleSliderRootProviderProps,
  type AngleSliderContextProps,
  type AngleSliderControlProps,
  type AngleSliderHiddenInputProps,
  type AngleSliderLabelProps,
  type AngleSliderMarkerProps,
  type AngleSliderMarkerGroupProps,
  type AngleSliderThumbProps,
  type AngleSliderValueTextProps,
}
