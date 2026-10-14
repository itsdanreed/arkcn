"use client"

import { useJsonTreeView } from "@ark-ui/react"
import * as React from "react"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { JsonTreeView as JsonTreeViewPrimitive } from "@ark-ui/react"

function JsonTreeViewRoot({ className, ...props }: JsonTreeViewRootProps) {
  return (
    <JsonTreeViewPrimitive.Root
      data-slot="json-tree-view"
      className={cn("w-full font-mono text-xs", className)}
      {...props}
    />
  )
}

function JsonTreeViewTree({ className, arrow = <ChevronRightIcon />, ...props }: JsonTreeViewTreeProps) {
  return (
    <JsonTreeViewPrimitive.Tree
      data-slot="json-tree-view-tree"
      arrow={arrow}
      className={cn(
        "flex flex-col gap-px outline-none",
        "**:data-[part=branch-control]:flex **:data-[part=branch-control]:h-7 **:data-[part=branch-control]:cursor-default **:data-[part=branch-control]:items-center **:data-[part=branch-control]:gap-1 **:data-[part=branch-control]:rounded-md **:data-[part=branch-control]:ps-[calc(var(--depth)*(--spacing(4)))] **:data-[part=branch-control]:pe-2 **:data-[part=branch-control]:outline-none **:data-[part=branch-control]:hover:bg-muted **:data-[part=branch-control]:focus-visible:ring-2 **:data-[part=branch-control]:focus-visible:ring-ring **:data-[part=branch-control]:data-selected:bg-muted",
        "**:data-[part=item]:flex **:data-[part=item]:h-7 **:data-[part=item]:cursor-default **:data-[part=item]:items-center **:data-[part=item]:gap-1 **:data-[part=item]:rounded-md **:data-[part=item]:ps-[calc(var(--depth)*(--spacing(4))+(--spacing(4)))] **:data-[part=item]:pe-2 **:data-[part=item]:outline-none **:data-[part=item]:hover:bg-muted **:data-[part=item]:focus-visible:ring-2 **:data-[part=item]:focus-visible:ring-ring **:data-[part=item]:data-selected:bg-muted",
        "**:data-[part=branch-indicator]:shrink-0 **:data-[part=branch-indicator]:text-foreground **:data-[part=branch-indicator]:transition-transform **:data-[part=branch-indicator]:data-[state=open]:rotate-90 motion-reduce:**:data-[part=branch-indicator]:transition-none rtl:**:data-[part=branch-indicator]:rotate-180 rtl:**:data-[part=branch-indicator]:data-[state=open]:rotate-90 **:data-[part=branch-indicator]:[&_svg]:size-4",
        "**:data-[part=branch-indent-guide]:absolute **:data-[part=branch-indent-guide]:inset-y-0 **:data-[part=branch-indent-guide]:inset-s-[calc(var(--depth)*(--spacing(4))+(--spacing(1.5)))] **:data-[part=branch-indent-guide]:w-px **:data-[part=branch-indent-guide]:bg-border",
        "**:data-[part=branch-content]:relative **:data-[part=branch-content]:flex **:data-[part=branch-content]:flex-col **:data-[part=branch-content]:gap-px",
        "**:data-[part=branch-text]:min-w-0 **:data-[part=branch-text]:truncate **:data-[part=item-text]:min-w-0 **:data-[part=item-text]:truncate",
        "**:data-[kind=colon]:text-muted-foreground **:data-[kind=key]:text-foreground",
        "**:data-[type=boolean]:text-amber-600 **:data-[type=null]:text-muted-foreground **:data-[type=number]:text-sky-600 **:data-[type=string]:text-emerald-600 **:data-[type=undefined]:text-muted-foreground dark:**:data-[type=boolean]:text-amber-400 dark:**:data-[type=number]:text-sky-400 dark:**:data-[type=string]:text-emerald-400",
        className
      )}
      {...props}
    />
  )
}

function JsonTreeViewRootProvider({ className, ...props }: JsonTreeViewRootProviderProps) {
  return (
    <JsonTreeViewPrimitive.RootProvider
      data-slot="json-tree-view"
      className={cn("w-full font-mono text-xs", className)}
      {...props}
    />
  )
}

type JsonTreeViewRootProps = React.ComponentProps<typeof JsonTreeViewPrimitive.Root>

type JsonTreeViewRootProviderProps = React.ComponentProps<typeof JsonTreeViewPrimitive.RootProvider>

type JsonTreeViewTreeProps = React.ComponentProps<typeof JsonTreeViewPrimitive.Tree>

const JsonTreeView = {
  Root: JsonTreeViewRoot,
  RootProvider: JsonTreeViewRootProvider,
  Tree: JsonTreeViewTree,
}

export {
  useJsonTreeView,
  JsonTreeView,
  type JsonTreeViewRootProps,
  type JsonTreeViewRootProviderProps,
  type JsonTreeViewTreeProps,
}
