"use client"

import { useClipboard, useClipboardContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Clipboard as ClipboardPrimitive } from "@ark-ui/react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function ClipboardRoot({ className, ...props }: ClipboardRootProps) {
  return (
    <ClipboardPrimitive.Root
      data-slot="clipboard"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function ClipboardContext({ ...props }: ClipboardContextProps) {
  return <ClipboardPrimitive.Context {...props} />
}

function ClipboardLabel({ className, ...props }: ClipboardLabelProps) {
  return (
    <ClipboardPrimitive.Label
      data-slot="clipboard-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function ClipboardControl({ className, ...props }: ClipboardControlProps) {
  return (
    <ClipboardPrimitive.Control
      data-slot="clipboard-control"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function ClipboardInput({ className, ...props }: ClipboardInputProps) {
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

function ClipboardTrigger({ className, children, ...props }: ClipboardTriggerProps) {
  return (
    <ClipboardPrimitive.Trigger data-slot="clipboard-trigger" className={cn(className)} asChild {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="outline" size="icon">
            {children ?? (
              <ClipboardIndicator copied={<CheckIcon />}>
                <CopyIcon />
              </ClipboardIndicator>
            )}
          </Button>
        </>
      )}
    </ClipboardPrimitive.Trigger>
  )
}

function ClipboardIndicator({ ...props }: ClipboardIndicatorProps) {
  return <ClipboardPrimitive.Indicator data-slot="clipboard-indicator" {...props} />
}

function ClipboardValueText({ className, ...props }: ClipboardValueTextProps) {
  return (
    <ClipboardPrimitive.ValueText
      data-slot="clipboard-value-text"
      className={cn("font-mono text-sm", className)}
      {...props}
    />
  )
}

function ClipboardRootProvider({ className, ...props }: ClipboardRootProviderProps) {
  return (
    <ClipboardPrimitive.RootProvider
      data-slot="clipboard"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type ClipboardRootProps = React.ComponentProps<typeof ClipboardPrimitive.Root>

type ClipboardRootProviderProps = React.ComponentProps<typeof ClipboardPrimitive.RootProvider>

type ClipboardContextProps = React.ComponentProps<typeof ClipboardPrimitive.Context>

type ClipboardControlProps = React.ComponentProps<typeof ClipboardPrimitive.Control>

type ClipboardIndicatorProps = React.ComponentProps<typeof ClipboardPrimitive.Indicator>

type ClipboardInputProps = React.ComponentProps<typeof ClipboardPrimitive.Input>

type ClipboardLabelProps = React.ComponentProps<typeof ClipboardPrimitive.Label>

type ClipboardTriggerProps = React.ComponentProps<typeof ClipboardPrimitive.Trigger>

type ClipboardValueTextProps = React.ComponentProps<typeof ClipboardPrimitive.ValueText>

const Clipboard = {
  Root: ClipboardRoot,
  RootProvider: ClipboardRootProvider,
  Context: ClipboardContext,
  Control: ClipboardControl,
  Indicator: ClipboardIndicator,
  Input: ClipboardInput,
  Label: ClipboardLabel,
  Trigger: ClipboardTrigger,
  ValueText: ClipboardValueText,
}

export {
  useClipboard,
  useClipboardContext,
  Clipboard,
  type ClipboardRootProps,
  type ClipboardRootProviderProps,
  type ClipboardContextProps,
  type ClipboardControlProps,
  type ClipboardIndicatorProps,
  type ClipboardInputProps,
  type ClipboardLabelProps,
  type ClipboardTriggerProps,
  type ClipboardValueTextProps,
}
