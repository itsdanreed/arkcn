"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Timer as TimerPrimitive } from "@ark-ui/react"

import { Button } from "@/components/ui/button"

function Timer({ className, ...props }: React.ComponentProps<typeof TimerPrimitive.Root>) {
  return (
    <TimerPrimitive.Root data-slot="timer" className={cn("flex flex-col items-center gap-3", className)} {...props} />
  )
}

function TimerContext({ ...props }: React.ComponentProps<typeof TimerPrimitive.Context>) {
  return <TimerPrimitive.Context {...props} />
}

function TimerArea({ className, ...props }: React.ComponentProps<typeof TimerPrimitive.Area>) {
  return (
    <TimerPrimitive.Area
      data-slot="timer-area"
      className={cn("flex items-center gap-1 font-mono text-2xl font-medium tabular-nums", className)}
      {...props}
    />
  )
}

function TimerItem({ className, ...props }: React.ComponentProps<typeof TimerPrimitive.Item>) {
  return (
    <TimerPrimitive.Item
      data-slot="timer-item"
      className={cn("flex min-w-10 items-center justify-center rounded-lg bg-muted px-2 py-1", className)}
      {...props}
    />
  )
}

function TimerSeparator({ className, children, ...props }: React.ComponentProps<typeof TimerPrimitive.Separator>) {
  return (
    <TimerPrimitive.Separator data-slot="timer-separator" className={cn("text-muted-foreground", className)} {...props}>
      {children ?? ":"}
    </TimerPrimitive.Separator>
  )
}

function TimerControl({ className, ...props }: React.ComponentProps<typeof TimerPrimitive.Control>) {
  return (
    <TimerPrimitive.Control data-slot="timer-control" className={cn("flex items-center gap-2", className)} {...props} />
  )
}

function TimerActionTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof TimerPrimitive.ActionTrigger>) {
  return (
    <TimerPrimitive.ActionTrigger data-slot="timer-action-trigger" className={cn(className)} asChild {...props}>
      {asChild ? (
        children
      ) : (
        <Button variant="outline" size="sm">
          {children}
        </Button>
      )}
    </TimerPrimitive.ActionTrigger>
  )
}

export { Timer, TimerActionTrigger, TimerArea, TimerContext, TimerControl, TimerItem, TimerSeparator }
