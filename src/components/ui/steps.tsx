"use client"

import { useSteps, useStepsContext, useStepsItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Steps as StepsPrimitive } from "@ark-ui/react"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function StepsRoot({ className, ...props }: StepsRootProps) {
  return (
    <StepsPrimitive.Root
      data-slot="steps"
      className={cn("flex w-full flex-col gap-4 data-vertical:flex-row", className)}
      {...props}
    />
  )
}

function StepsContext({ ...props }: StepsContextProps) {
  return <StepsPrimitive.Context {...props} />
}

function StepsList({ className, ...props }: StepsListProps) {
  return (
    <StepsPrimitive.List
      data-slot="steps-list"
      className={cn("flex items-center gap-2 data-vertical:flex-col data-vertical:items-stretch", className)}
      {...props}
    />
  )
}

function StepsItem({ className, ...props }: StepsItemProps) {
  return (
    <StepsPrimitive.Item
      data-slot="steps-item"
      className={cn(
        "group/steps-item flex flex-1 items-center gap-2 last:flex-none data-vertical:flex-col data-vertical:items-start",
        className
      )}
      {...props}
    />
  )
}

function StepsItemContext({ ...props }: StepsItemContextProps) {
  return <StepsPrimitive.ItemContext {...props} />
}

function StepsTrigger({ className, ...props }: StepsTriggerProps) {
  return (
    <StepsPrimitive.Trigger
      data-slot="steps-trigger"
      className={cn(
        "flex items-center gap-2 rounded-md text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-incomplete:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function StepsIndicator({ className, children, ...props }: StepsIndicatorProps) {
  return (
    <StepsPrimitive.Indicator
      data-slot="steps-indicator"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border border-input text-xs font-medium tabular-nums transition-colors data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-current:border-primary data-current:bg-primary data-current:text-primary-foreground [&_svg]:size-3.5",
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
          {children ?? (
            <StepsPrimitive.ItemContext>
              {({ completed, index }) => (completed ? <CheckIcon /> : index + 1)}
            </StepsPrimitive.ItemContext>
          )}
        </>
      )}
    </StepsPrimitive.Indicator>
  )
}

function StepsSeparator({ className, ...props }: StepsSeparatorProps) {
  return (
    <StepsPrimitive.Separator
      data-slot="steps-separator"
      className={cn(
        "h-px flex-1 bg-border transition-colors data-complete:bg-primary data-vertical:ml-3.5 data-vertical:h-6 data-vertical:w-px data-vertical:flex-none",
        className
      )}
      {...props}
    />
  )
}

function StepsContent({ className, ...props }: StepsContentProps) {
  return <StepsPrimitive.Content data-slot="steps-content" className={cn("text-sm", className)} {...props} />
}

function StepsCompletedContent({ className, ...props }: StepsCompletedContentProps) {
  return (
    <StepsPrimitive.CompletedContent
      data-slot="steps-completed-content"
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function StepsProgress({ className, ...props }: StepsProgressProps) {
  return (
    <StepsPrimitive.Progress
      data-slot="steps-progress"
      className={cn("h-1 w-full rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function StepsPrevTrigger({ className, children, asChild, ...props }: StepsPrevTriggerProps) {
  return (
    <StepsPrimitive.PrevTrigger data-slot="steps-prev-trigger" className={cn(className)} asChild {...props}>
      {asChild ? (
        children
      ) : (
        <Button variant="outline" size="sm">
          {children}
        </Button>
      )}
    </StepsPrimitive.PrevTrigger>
  )
}

function StepsNextTrigger({ className, children, asChild, ...props }: StepsNextTriggerProps) {
  return (
    <StepsPrimitive.NextTrigger data-slot="steps-next-trigger" className={cn(className)} asChild {...props}>
      {asChild ? children : <Button size="sm">{children}</Button>}
    </StepsPrimitive.NextTrigger>
  )
}

function StepsRootProvider({ className, ...props }: StepsRootProviderProps) {
  return (
    <StepsPrimitive.RootProvider
      data-slot="steps"
      className={cn("flex w-full flex-col gap-4 data-vertical:flex-row", className)}
      {...props}
    />
  )
}

type StepsRootProps = React.ComponentProps<typeof StepsPrimitive.Root>

type StepsRootProviderProps = React.ComponentProps<typeof StepsPrimitive.RootProvider>

type StepsCompletedContentProps = React.ComponentProps<typeof StepsPrimitive.CompletedContent>

type StepsContentProps = React.ComponentProps<typeof StepsPrimitive.Content>

type StepsContextProps = React.ComponentProps<typeof StepsPrimitive.Context>

type StepsIndicatorProps = React.ComponentProps<typeof StepsPrimitive.Indicator>

type StepsItemProps = React.ComponentProps<typeof StepsPrimitive.Item>

type StepsItemContextProps = React.ComponentProps<typeof StepsPrimitive.ItemContext>

type StepsListProps = React.ComponentProps<typeof StepsPrimitive.List>

type StepsNextTriggerProps = React.ComponentProps<typeof StepsPrimitive.NextTrigger>

type StepsPrevTriggerProps = React.ComponentProps<typeof StepsPrimitive.PrevTrigger>

type StepsProgressProps = React.ComponentProps<typeof StepsPrimitive.Progress>

type StepsSeparatorProps = React.ComponentProps<typeof StepsPrimitive.Separator>

type StepsTriggerProps = React.ComponentProps<typeof StepsPrimitive.Trigger>

const Steps = {
  Root: StepsRoot,
  RootProvider: StepsRootProvider,
  CompletedContent: StepsCompletedContent,
  Content: StepsContent,
  Context: StepsContext,
  Indicator: StepsIndicator,
  Item: StepsItem,
  ItemContext: StepsItemContext,
  List: StepsList,
  NextTrigger: StepsNextTrigger,
  PrevTrigger: StepsPrevTrigger,
  Progress: StepsProgress,
  Separator: StepsSeparator,
  Trigger: StepsTrigger,
}

export {
  useSteps,
  useStepsContext,
  useStepsItemContext,
  Steps,
  type StepsRootProps,
  type StepsRootProviderProps,
  type StepsCompletedContentProps,
  type StepsContentProps,
  type StepsContextProps,
  type StepsIndicatorProps,
  type StepsItemProps,
  type StepsItemContextProps,
  type StepsListProps,
  type StepsNextTriggerProps,
  type StepsPrevTriggerProps,
  type StepsProgressProps,
  type StepsSeparatorProps,
  type StepsTriggerProps,
}
