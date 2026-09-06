"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Clipboard as ClipboardPrimitive } from "@ark-ui/react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function Clipboard({ className, ...props }: React.ComponentProps<typeof ClipboardPrimitive.Root>) {
  return (
    <ClipboardPrimitive.Root
      data-slot="clipboard"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function ClipboardContext({ ...props }: React.ComponentProps<typeof ClipboardPrimitive.Context>) {
  return <ClipboardPrimitive.Context {...props} />
}

function ClipboardLabel({ className, ...props }: React.ComponentProps<typeof ClipboardPrimitive.Label>) {
  return (
    <ClipboardPrimitive.Label
      data-slot="clipboard-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function ClipboardControl({ className, ...props }: React.ComponentProps<typeof ClipboardPrimitive.Control>) {
  return (
    <ClipboardPrimitive.Control
      data-slot="clipboard-control"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function ClipboardInput({ className, ...props }: React.ComponentProps<typeof ClipboardPrimitive.Input>) {
  return (
    <ClipboardPrimitive.Input
      data-slot="clipboard-input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none read-only:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function ClipboardTrigger({ className, children, ...props }: React.ComponentProps<typeof ClipboardPrimitive.Trigger>) {
  return (
    <ClipboardPrimitive.Trigger data-slot="clipboard-trigger" className={cn(className)} asChild {...props}>
      <Button variant="outline" size="icon">
        {children ?? (
          <ClipboardIndicator copied={<CheckIcon />}>
            <CopyIcon />
          </ClipboardIndicator>
        )}
      </Button>
    </ClipboardPrimitive.Trigger>
  )
}

function ClipboardIndicator({ ...props }: React.ComponentProps<typeof ClipboardPrimitive.Indicator>) {
  return <ClipboardPrimitive.Indicator data-slot="clipboard-indicator" {...props} />
}

function ClipboardValueText({ className, ...props }: React.ComponentProps<typeof ClipboardPrimitive.ValueText>) {
  return (
    <ClipboardPrimitive.ValueText
      data-slot="clipboard-value-text"
      className={cn("font-mono text-sm", className)}
      {...props}
    />
  )
}

export {
  Clipboard,
  ClipboardContext,
  ClipboardControl,
  ClipboardIndicator,
  ClipboardInput,
  ClipboardLabel,
  ClipboardTrigger,
  ClipboardValueText,
}
