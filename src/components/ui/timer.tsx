"use client"

import { useTimer, useTimerContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Timer as TimerPrimitive } from "@ark-ui/react"

import { Button } from "@/components/ui/button"

function TimerRoot({ className, ...props }: TimerRootProps) {
  return (
    <TimerPrimitive.Root data-slot="timer" className={cn("flex flex-col items-center gap-3", className)} {...props} />
  )
}

function TimerContext({ ...props }: TimerContextProps) {
  return <TimerPrimitive.Context {...props} />
}

function TimerArea({ className, ...props }: TimerAreaProps) {
  return (
    <TimerPrimitive.Area
      data-slot="timer-area"
      className={cn("flex items-center gap-1 font-mono text-2xl font-medium tabular-nums", className)}
      {...props}
    />
  )
}

function TimerItem({ className, ...props }: TimerItemProps) {
  return (
    <TimerPrimitive.Item
      data-slot="timer-item"
      className={cn("flex min-w-10 items-center justify-center rounded-lg bg-muted px-2 py-1", className)}
      {...props}
    />
  )
}

function TimerSeparator({ className, children, ...props }: TimerSeparatorProps) {
  return (
    <TimerPrimitive.Separator data-slot="timer-separator" className={cn("text-muted-foreground", className)} {...props}>
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? ":"}</>}
    </TimerPrimitive.Separator>
  )
}

function TimerControl({ className, ...props }: TimerControlProps) {
  return (
    <TimerPrimitive.Control data-slot="timer-control" className={cn("flex items-center gap-2", className)} {...props} />
  )
}

function TimerActionTrigger({ className, children, asChild, ...props }: TimerActionTriggerProps) {
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

function TimerRootProvider({ className, ...props }: TimerRootProviderProps) {
  return (
    <TimerPrimitive.RootProvider
      data-slot="timer"
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    />
  )
}

type TimerRootProps = React.ComponentProps<typeof TimerPrimitive.Root>

type TimerRootProviderProps = React.ComponentProps<typeof TimerPrimitive.RootProvider>

type TimerActionTriggerProps = React.ComponentProps<typeof TimerPrimitive.ActionTrigger>

type TimerAreaProps = React.ComponentProps<typeof TimerPrimitive.Area>

type TimerContextProps = React.ComponentProps<typeof TimerPrimitive.Context>

type TimerControlProps = React.ComponentProps<typeof TimerPrimitive.Control>

type TimerItemProps = React.ComponentProps<typeof TimerPrimitive.Item>

type TimerSeparatorProps = React.ComponentProps<typeof TimerPrimitive.Separator>

const Timer = {
  Root: TimerRoot,
  RootProvider: TimerRootProvider,
  ActionTrigger: TimerActionTrigger,
  Area: TimerArea,
  Context: TimerContext,
  Control: TimerControl,
  Item: TimerItem,
  Separator: TimerSeparator,
}

export {
  useTimer,
  useTimerContext,
  Timer,
  type TimerRootProps,
  type TimerRootProviderProps,
  type TimerActionTriggerProps,
  type TimerAreaProps,
  type TimerContextProps,
  type TimerControlProps,
  type TimerItemProps,
  type TimerSeparatorProps,
}
