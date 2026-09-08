"use client"

import { cn } from "@/lib/utils"

import { useCollapsible, useCollapsibleContext } from "@ark-ui/react"
import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@ark-ui/react"

function CollapsibleRoot({ lazyMount = true, unmountOnExit = true, ...props }: CollapsibleRootProps) {
  return (
    <CollapsiblePrimitive.Root data-slot="collapsible" lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
  )
}

function CollapsibleContext({ ...props }: CollapsibleContextProps) {
  return <CollapsiblePrimitive.Context {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsibleTriggerProps) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleIndicator({ ...props }: CollapsibleIndicatorProps) {
  return <CollapsiblePrimitive.Indicator data-slot="collapsible-indicator" {...props} />
}

function CollapsibleContent({ ...props }: CollapsibleContentProps) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" {...props} />
}

function CollapsibleRootProvider({ className, ...props }: CollapsibleRootProviderProps) {
  return <CollapsiblePrimitive.RootProvider data-slot="collapsible" className={cn(className)} {...props} />
}

type CollapsibleRootProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>

type CollapsibleRootProviderProps = React.ComponentProps<typeof CollapsiblePrimitive.RootProvider>

type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Content>

type CollapsibleContextProps = React.ComponentProps<typeof CollapsiblePrimitive.Context>

type CollapsibleIndicatorProps = React.ComponentProps<typeof CollapsiblePrimitive.Indicator>

type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger>

const Collapsible = {
  Root: CollapsibleRoot,
  RootProvider: CollapsibleRootProvider,
  Content: CollapsibleContent,
  Context: CollapsibleContext,
  Indicator: CollapsibleIndicator,
  Trigger: CollapsibleTrigger,
}

export {
  useCollapsible,
  useCollapsibleContext,
  Collapsible,
  type CollapsibleRootProps,
  type CollapsibleRootProviderProps,
  type CollapsibleContentProps,
  type CollapsibleContextProps,
  type CollapsibleIndicatorProps,
  type CollapsibleTriggerProps,
}
