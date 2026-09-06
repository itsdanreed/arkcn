"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TreeView as TreeViewPrimitive, createTreeCollection, type TreeCollection, type TreeNode } from "@ark-ui/react"
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react"

function TreeView<T extends TreeNode>({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.Root<T>>) {
  return <TreeViewPrimitive.Root data-slot="tree-view" className={cn("w-full text-sm", className)} {...props} />
}

function TreeViewContext({ ...props }: React.ComponentProps<typeof TreeViewPrimitive.Context>) {
  return <TreeViewPrimitive.Context {...props} />
}

function TreeViewLabel({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.Label>) {
  return (
    <TreeViewPrimitive.Label
      data-slot="tree-view-label"
      className={cn("mb-1 text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function TreeViewTree({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.Tree>) {
  return (
    <TreeViewPrimitive.Tree
      data-slot="tree-view-tree"
      className={cn("flex flex-col gap-px outline-none", className)}
      {...props}
    />
  )
}

function TreeViewNodeProvider<T>({ ...props }: React.ComponentProps<typeof TreeViewPrimitive.NodeProvider<T>>) {
  return <TreeViewPrimitive.NodeProvider {...props} />
}

function TreeViewNodeContext({ ...props }: React.ComponentProps<typeof TreeViewPrimitive.NodeContext>) {
  return <TreeViewPrimitive.NodeContext {...props} />
}

const rowClassName =
  "group/tree-row relative flex h-7 cursor-default items-center gap-1.5 rounded-md py-1 pr-2 pl-[calc(var(--depth)*--spacing(4)+--spacing(1.5))] outline-none select-none hover:bg-muted data-selected:bg-muted data-selected:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function TreeViewBranch({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.Branch>) {
  return (
    <TreeViewPrimitive.Branch
      data-slot="tree-view-branch"
      className={cn("flex flex-col gap-px", className)}
      {...props}
    />
  )
}

function TreeViewBranchControl({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.BranchControl>) {
  return (
    <TreeViewPrimitive.BranchControl
      data-slot="tree-view-branch-control"
      className={cn(rowClassName, className)}
      {...props}
    />
  )
}

function TreeViewBranchTrigger({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.BranchTrigger>) {
  return (
    <TreeViewPrimitive.BranchTrigger
      data-slot="tree-view-branch-trigger"
      className={cn("inline-flex", className)}
      {...props}
    />
  )
}

function TreeViewBranchIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.BranchIndicator>) {
  return (
    <TreeViewPrimitive.BranchIndicator
      data-slot="tree-view-branch-indicator"
      className={cn("text-muted-foreground transition-transform data-[state=open]:rotate-90", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </TreeViewPrimitive.BranchIndicator>
  )
}

function TreeViewBranchText({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.BranchText>) {
  return (
    <TreeViewPrimitive.BranchText data-slot="tree-view-branch-text" className={cn("truncate", className)} {...props} />
  )
}

function TreeViewBranchContent({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.BranchContent>) {
  return (
    <TreeViewPrimitive.BranchContent
      data-slot="tree-view-branch-content"
      className={cn("relative flex flex-col gap-px", className)}
      {...props}
    />
  )
}

function TreeViewBranchIndentGuide({
  className,
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.BranchIndentGuide>) {
  return (
    <TreeViewPrimitive.BranchIndentGuide
      data-slot="tree-view-branch-indent-guide"
      className={cn(
        "absolute inset-y-0 left-[calc(var(--depth)*(--spacing(4))+(--spacing(3)))] w-px bg-border",
        className
      )}
      {...props}
    />
  )
}

function TreeViewItem({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.Item>) {
  return <TreeViewPrimitive.Item data-slot="tree-view-item" className={cn(rowClassName, className)} {...props} />
}

function TreeViewItemIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.ItemIndicator>) {
  return (
    <TreeViewPrimitive.ItemIndicator
      data-slot="tree-view-item-indicator"
      className={cn("ml-auto text-muted-foreground", className)}
      {...props}
    >
      {children ?? <CheckIcon />}
    </TreeViewPrimitive.ItemIndicator>
  )
}

function TreeViewItemText({ className, ...props }: React.ComponentProps<typeof TreeViewPrimitive.ItemText>) {
  return <TreeViewPrimitive.ItemText data-slot="tree-view-item-text" className={cn("truncate", className)} {...props} />
}

function TreeViewNodeCheckbox({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.NodeCheckbox>) {
  return (
    <TreeViewPrimitive.NodeCheckbox
      data-slot="tree-view-node-checkbox"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-lg border border-input text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-checked:border-primary data-checked:bg-primary [&_svg]:size-3",
        className
      )}
      {...props}
    >
      {children ?? (
        <TreeViewNodeCheckboxIndicator indeterminate={<MinusIcon />}>
          <CheckIcon />
        </TreeViewNodeCheckboxIndicator>
      )}
    </TreeViewPrimitive.NodeCheckbox>
  )
}

function TreeViewNodeCheckboxIndicator({
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.NodeCheckboxIndicator>) {
  return <TreeViewPrimitive.NodeCheckboxIndicator data-slot="tree-view-node-checkbox-indicator" {...props} />
}

function TreeViewNodeRenameInput({
  className,
  ...props
}: React.ComponentProps<typeof TreeViewPrimitive.NodeRenameInput>) {
  return (
    <TreeViewPrimitive.NodeRenameInput
      data-slot="tree-view-node-rename-input"
      className={cn(
        "h-6 min-w-0 flex-1 rounded-sm border border-input bg-background px-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

export {
  TreeView,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchControl,
  TreeViewBranchIndentGuide,
  TreeViewBranchIndicator,
  TreeViewBranchText,
  TreeViewBranchTrigger,
  TreeViewContext,
  TreeViewItem,
  TreeViewItemIndicator,
  TreeViewItemText,
  TreeViewLabel,
  TreeViewNodeCheckbox,
  TreeViewNodeCheckboxIndicator,
  TreeViewNodeContext,
  TreeViewNodeProvider,
  TreeViewNodeRenameInput,
  TreeViewTree,
  createTreeCollection,
  type TreeCollection,
  type TreeNode,
}
