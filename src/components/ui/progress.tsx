"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress as ProgressPrimitive } from "@ark-ui/react"

function Progress({ className, children, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn("flex w-full flex-col gap-1", className)} {...props}>
      {children}
      <ProgressTrack>
        <ProgressRange />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressRoot({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn("flex w-full flex-col gap-1", className)} {...props} />
  )
}

function ProgressContext({ ...props }: React.ComponentProps<typeof ProgressPrimitive.Context>) {
  return <ProgressPrimitive.Context {...props} />
}

function ProgressLabel({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Label>) {
  return (
    <ProgressPrimitive.Label data-slot="progress-label" className={cn("text-sm font-medium", className)} {...props} />
  )
}

function ProgressValueText({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.ValueText>) {
  return (
    <ProgressPrimitive.ValueText
      data-slot="progress-value-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ProgressTrack({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Track>) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn("relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function ProgressRange({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Range>) {
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

function ProgressCircle({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.Circle>) {
  return (
    <ProgressPrimitive.Circle
      data-slot="progress-circle"
      className={cn("[--size:2.5rem] [--thickness:3px]", className)}
      {...props}
    />
  )
}

function ProgressCircleTrack({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.CircleTrack>) {
  return (
    <ProgressPrimitive.CircleTrack
      data-slot="progress-circle-track"
      className={cn("stroke-muted", className)}
      {...props}
    />
  )
}

function ProgressCircleRange({ className, ...props }: React.ComponentProps<typeof ProgressPrimitive.CircleRange>) {
  return (
    <ProgressPrimitive.CircleRange
      data-slot="progress-circle-range"
      className={cn("stroke-primary transition-all", className)}
      {...props}
    />
  )
}

/** Renders only while the progress is in the given `state` (`loading`, `complete`, `indeterminate`). */
function ProgressView({ ...props }: React.ComponentProps<typeof ProgressPrimitive.View>) {
  return <ProgressPrimitive.View data-slot="progress-view" {...props} />
}

export {
  Progress,
  ProgressCircle,
  ProgressCircleRange,
  ProgressCircleTrack,
  ProgressContext,
  ProgressLabel,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  ProgressValueText,
  ProgressView,
}
