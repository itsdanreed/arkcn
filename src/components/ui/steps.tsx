"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Steps as StepsPrimitive } from "@ark-ui/react"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function Steps({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Root>) {
  return (
    <StepsPrimitive.Root
      data-slot="steps"
      className={cn("flex w-full flex-col gap-4 data-vertical:flex-row", className)}
      {...props}
    />
  )
}

function StepsContext({ ...props }: React.ComponentProps<typeof StepsPrimitive.Context>) {
  return <StepsPrimitive.Context {...props} />
}

function StepsList({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.List>) {
  return (
    <StepsPrimitive.List
      data-slot="steps-list"
      className={cn("flex items-center gap-2 data-vertical:flex-col data-vertical:items-stretch", className)}
      {...props}
    />
  )
}

function StepsItem({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Item>) {
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

function StepsItemContext({ ...props }: React.ComponentProps<typeof StepsPrimitive.ItemContext>) {
  return <StepsPrimitive.ItemContext {...props} />
}

function StepsTrigger({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Trigger>) {
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

function StepsIndicator({ className, children, ...props }: React.ComponentProps<typeof StepsPrimitive.Indicator>) {
  return (
    <StepsPrimitive.Indicator
      data-slot="steps-indicator"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border border-input text-xs font-medium tabular-nums transition-colors data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-current:border-primary data-current:bg-primary data-current:text-primary-foreground [&_svg]:size-3.5",
        className
      )}
      {...props}
    >
      {children ?? (
        <StepsPrimitive.ItemContext>
          {({ completed, index }) => (completed ? <CheckIcon /> : index + 1)}
        </StepsPrimitive.ItemContext>
      )}
    </StepsPrimitive.Indicator>
  )
}

function StepsSeparator({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Separator>) {
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

function StepsContent({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Content>) {
  return <StepsPrimitive.Content data-slot="steps-content" className={cn("text-sm", className)} {...props} />
}

function StepsCompletedContent({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.CompletedContent>) {
  return (
    <StepsPrimitive.CompletedContent
      data-slot="steps-completed-content"
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function StepsProgress({ className, ...props }: React.ComponentProps<typeof StepsPrimitive.Progress>) {
  return (
    <StepsPrimitive.Progress
      data-slot="steps-progress"
      className={cn("h-1 w-full rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function StepsPrevTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof StepsPrimitive.PrevTrigger>) {
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

function StepsNextTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof StepsPrimitive.NextTrigger>) {
  return (
    <StepsPrimitive.NextTrigger data-slot="steps-next-trigger" className={cn(className)} asChild {...props}>
      {asChild ? children : <Button size="sm">{children}</Button>}
    </StepsPrimitive.NextTrigger>
  )
}

export {
  Steps,
  StepsCompletedContent,
  StepsContent,
  StepsContext,
  StepsIndicator,
  StepsItem,
  StepsItemContext,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsProgress,
  StepsSeparator,
  StepsTrigger,
}
