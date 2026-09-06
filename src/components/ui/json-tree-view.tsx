"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { JsonTreeView as JsonTreeViewPrimitive } from "@ark-ui/react"

function JsonTreeView({ className, ...props }: React.ComponentProps<typeof JsonTreeViewPrimitive.Root>) {
  return (
    <JsonTreeViewPrimitive.Root
      data-slot="json-tree-view"
      className={cn("w-full font-mono text-xs", className)}
      {...props}
    />
  )
}

function JsonTreeViewTree({ className, ...props }: React.ComponentProps<typeof JsonTreeViewPrimitive.Tree>) {
  return (
    <JsonTreeViewPrimitive.Tree
      data-slot="json-tree-view-tree"
      className={cn(
        "flex flex-col gap-px outline-none",
        "**:data-[part=branch-control]:flex **:data-[part=branch-control]:h-6 **:data-[part=branch-control]:cursor-default **:data-[part=branch-control]:items-center **:data-[part=branch-control]:gap-1 **:data-[part=branch-control]:rounded-md **:data-[part=branch-control]:pl-[calc(var(--depth)*(--spacing(4)))] **:data-[part=branch-control]:outline-none **:data-[part=branch-control]:hover:bg-muted **:data-[part=branch-control]:focus-visible:ring-2 **:data-[part=branch-control]:focus-visible:ring-ring/50 **:data-[part=branch-control]:focus-visible:ring-inset **:data-[part=branch-control]:data-selected:bg-muted",
        "**:data-[part=item]:flex **:data-[part=item]:h-6 **:data-[part=item]:cursor-default **:data-[part=item]:items-center **:data-[part=item]:gap-1 **:data-[part=item]:rounded-md **:data-[part=item]:pl-[calc(var(--depth)*(--spacing(4))+(--spacing(4)))] **:data-[part=item]:outline-none **:data-[part=item]:hover:bg-muted **:data-[part=item]:focus-visible:ring-2 **:data-[part=item]:focus-visible:ring-ring/50 **:data-[part=item]:focus-visible:ring-inset **:data-[part=item]:data-selected:bg-muted",
        "**:data-[part=branch-indicator]:text-muted-foreground **:data-[part=branch-indicator]:transition-transform **:data-[part=branch-indicator]:data-[state=open]:rotate-90 **:data-[part=branch-indicator]:[&_svg]:size-3.5",
        "**:data-[part=branch-indent-guide]:absolute **:data-[part=branch-indent-guide]:inset-y-0 **:data-[part=branch-indent-guide]:left-[calc(var(--depth)*(--spacing(4))+(--spacing(1.5)))] **:data-[part=branch-indent-guide]:w-px **:data-[part=branch-indent-guide]:bg-border",
        "**:data-[part=branch-content]:relative **:data-[part=branch-content]:flex **:data-[part=branch-content]:flex-col **:data-[part=branch-content]:gap-px",
        "**:data-[part=key]:text-foreground **:data-[part=key]:after:text-muted-foreground **:data-[part=key]:after:content-[':']",
        "**:data-[part=value]:data-[kind=boolean]:text-amber-600 **:data-[part=value]:data-[kind=null]:text-muted-foreground **:data-[part=value]:data-[kind=number]:text-sky-600 **:data-[part=value]:data-[kind=string]:text-emerald-600 **:data-[part=value]:data-[kind=undefined]:text-muted-foreground dark:**:data-[part=value]:data-[kind=boolean]:text-amber-400 dark:**:data-[part=value]:data-[kind=number]:text-sky-400 dark:**:data-[part=value]:data-[kind=string]:text-emerald-400",
        className
      )}
      {...props}
    />
  )
}

export { JsonTreeView, JsonTreeViewTree }
