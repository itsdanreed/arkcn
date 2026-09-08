"use client"

import { useProgress, useProgressContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress as ProgressPrimitive } from "@ark-ui/react"

function ProgressRoot({ className, ...props }: ProgressRootProps) {
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn("flex w-full flex-col gap-1", className)} {...props} />
  )
}

function ProgressContext({ ...props }: ProgressContextProps) {
  return <ProgressPrimitive.Context {...props} />
}

function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <ProgressPrimitive.Label data-slot="progress-label" className={cn("text-sm font-medium", className)} {...props} />
  )
}

function ProgressValueText({ className, ...props }: ProgressValueTextProps) {
  return (
    <ProgressPrimitive.ValueText
      data-slot="progress-value-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn("relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function ProgressRange({ className, ...props }: ProgressRangeProps) {
  return (
    <ProgressPrimitive.Range
      data-slot="progress-indicator"
      className={cn(
        "h-full bg-primary transition-all data-[state=indeterminate]:w-1/3 data-[state=indeterminate]:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

function ProgressCircle({ className, ...props }: ProgressCircleProps) {
  return (
    <ProgressPrimitive.Circle
      data-slot="progress-circle"
      className={cn("[--size:2.5rem] [--thickness:3px]", className)}
      {...props}
    />
  )
}

function ProgressCircleTrack({ className, ...props }: ProgressCircleTrackProps) {
  return (
    <ProgressPrimitive.CircleTrack
      data-slot="progress-circle-track"
      className={cn("stroke-muted", className)}
      {...props}
    />
  )
}

function ProgressCircleRange({ className, ...props }: ProgressCircleRangeProps) {
  return (
    <ProgressPrimitive.CircleRange
      data-slot="progress-circle-range"
      className={cn("stroke-primary transition-all", className)}
      {...props}
    />
  )
}

/** Renders only while the progress is in the given `state` (`loading`, `complete`, `indeterminate`). */
function ProgressView({ ...props }: ProgressViewProps) {
  return <ProgressPrimitive.View data-slot="progress-view" {...props} />
}

function ProgressRootProvider({ className, ...props }: ProgressRootProviderProps) {
  return (
    <ProgressPrimitive.RootProvider
      data-slot="progress"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  )
}

type ProgressRootProps = React.ComponentProps<typeof ProgressPrimitive.Root>

type ProgressRootProviderProps = React.ComponentProps<typeof ProgressPrimitive.RootProvider>

type ProgressCircleProps = React.ComponentProps<typeof ProgressPrimitive.Circle>

type ProgressCircleRangeProps = React.ComponentProps<typeof ProgressPrimitive.CircleRange>

type ProgressCircleTrackProps = React.ComponentProps<typeof ProgressPrimitive.CircleTrack>

type ProgressContextProps = React.ComponentProps<typeof ProgressPrimitive.Context>

type ProgressLabelProps = React.ComponentProps<typeof ProgressPrimitive.Label>

type ProgressRangeProps = React.ComponentProps<typeof ProgressPrimitive.Range>

type ProgressTrackProps = React.ComponentProps<typeof ProgressPrimitive.Track>

type ProgressValueTextProps = React.ComponentProps<typeof ProgressPrimitive.ValueText>

type ProgressViewProps = React.ComponentProps<typeof ProgressPrimitive.View>

const Progress = {
  Root: ProgressRoot,
  RootProvider: ProgressRootProvider,
  Circle: ProgressCircle,
  CircleRange: ProgressCircleRange,
  CircleTrack: ProgressCircleTrack,
  Context: ProgressContext,
  Label: ProgressLabel,
  Range: ProgressRange,
  Track: ProgressTrack,
  ValueText: ProgressValueText,
  View: ProgressView,
}

export {
  useProgress,
  useProgressContext,
  Progress,
  type ProgressRootProps,
  type ProgressRootProviderProps,
  type ProgressCircleProps,
  type ProgressCircleRangeProps,
  type ProgressCircleTrackProps,
  type ProgressContextProps,
  type ProgressLabelProps,
  type ProgressRangeProps,
  type ProgressTrackProps,
  type ProgressValueTextProps,
  type ProgressViewProps,
}
