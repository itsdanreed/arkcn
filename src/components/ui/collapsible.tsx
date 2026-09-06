"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@ark-ui/react"

function Collapsible({
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return (
    <CollapsiblePrimitive.Root data-slot="collapsible" lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
  )
}

function CollapsibleContext({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Context>) {
  return <CollapsiblePrimitive.Context {...props} />
}

function CollapsibleTrigger({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleIndicator({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Indicator>) {
  return <CollapsiblePrimitive.Indicator data-slot="collapsible-indicator" {...props} />
}

function CollapsibleContent({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" {...props} />
}

export { Collapsible, CollapsibleContent, CollapsibleContext, CollapsibleIndicator, CollapsibleTrigger }
