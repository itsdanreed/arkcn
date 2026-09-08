"use client"

import { useTreeView, useTreeViewContext, useTreeViewNodeContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { TreeView as TreeViewPrimitive, createTreeCollection, type TreeCollection, type TreeNode } from "@ark-ui/react"
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react"

function TreeViewRoot<T extends TreeNode>({ className, ...props }: TreeViewRootProps<T>) {
  return <TreeViewPrimitive.Root data-slot="tree-view" className={cn("w-full text-sm", className)} {...props} />
}

function TreeViewContext({ ...props }: TreeViewContextProps) {
  return <TreeViewPrimitive.Context {...props} />
}

function TreeViewLabel({ className, ...props }: TreeViewLabelProps) {
  return (
    <TreeViewPrimitive.Label
      data-slot="tree-view-label"
      className={cn("mb-1 text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function TreeViewTree({ className, ...props }: TreeViewTreeProps) {
  return (
    <TreeViewPrimitive.Tree
      data-slot="tree-view-tree"
      className={cn("flex flex-col gap-px outline-none", className)}
      {...props}
    />
  )
}

function TreeViewNodeProvider<T>({ ...props }: TreeViewNodeProviderProps<T>) {
  return <TreeViewPrimitive.NodeProvider {...props} />
}

function TreeViewNodeContext({ ...props }: TreeViewNodeContextProps) {
  return <TreeViewPrimitive.NodeContext {...props} />
}

const rowClassName =
  "group/tree-row relative flex h-7 cursor-default items-center gap-1.5 rounded-md py-1 pr-2 pl-[calc(var(--depth)*--spacing(4)+--spacing(1.5))] outline-none select-none hover:bg-muted data-selected:bg-muted data-selected:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function TreeViewBranch({ className, ...props }: TreeViewBranchProps) {
  return (
    <TreeViewPrimitive.Branch
      data-slot="tree-view-branch"
      className={cn("flex flex-col gap-px", className)}
      {...props}
    />
  )
}

function TreeViewBranchControl({ className, ...props }: TreeViewBranchControlProps) {
  return (
    <TreeViewPrimitive.BranchControl
      data-slot="tree-view-branch-control"
      className={cn(rowClassName, className)}
      {...props}
    />
  )
}

function TreeViewBranchTrigger({ className, ...props }: TreeViewBranchTriggerProps) {
  return (
    <TreeViewPrimitive.BranchTrigger
      data-slot="tree-view-branch-trigger"
      className={cn("inline-flex", className)}
      {...props}
    />
  )
}

function TreeViewBranchIndicator({ className, children, ...props }: TreeViewBranchIndicatorProps) {
  return (
    <TreeViewPrimitive.BranchIndicator
      data-slot="tree-view-branch-indicator"
      className={cn("text-muted-foreground transition-transform data-[state=open]:rotate-90", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <ChevronRightIcon />}</>}
    </TreeViewPrimitive.BranchIndicator>
  )
}

function TreeViewBranchText({ className, ...props }: TreeViewBranchTextProps) {
  return (
    <TreeViewPrimitive.BranchText data-slot="tree-view-branch-text" className={cn("truncate", className)} {...props} />
  )
}

function TreeViewBranchContent({ className, ...props }: TreeViewBranchContentProps) {
  return (
    <TreeViewPrimitive.BranchContent
      data-slot="tree-view-branch-content"
      className={cn("relative flex flex-col gap-px", className)}
      {...props}
    />
  )
}

function TreeViewBranchIndentGuide({ className, ...props }: TreeViewBranchIndentGuideProps) {
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

function TreeViewItem({ className, ...props }: TreeViewItemProps) {
  return <TreeViewPrimitive.Item data-slot="tree-view-item" className={cn(rowClassName, className)} {...props} />
}

function TreeViewItemIndicator({ className, children, ...props }: TreeViewItemIndicatorProps) {
  return (
    <TreeViewPrimitive.ItemIndicator
      data-slot="tree-view-item-indicator"
      className={cn("ml-auto text-muted-foreground", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <CheckIcon />}</>}
    </TreeViewPrimitive.ItemIndicator>
  )
}

function TreeViewItemText({ className, ...props }: TreeViewItemTextProps) {
  return <TreeViewPrimitive.ItemText data-slot="tree-view-item-text" className={cn("truncate", className)} {...props} />
}

function TreeViewNodeCheckbox({ className, children, ...props }: TreeViewNodeCheckboxProps) {
  return (
    <TreeViewPrimitive.NodeCheckbox
      data-slot="tree-view-node-checkbox"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-lg border border-input text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-checked:border-primary data-checked:bg-primary [&_svg]:size-3",
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
            <TreeViewNodeCheckboxIndicator indeterminate={<MinusIcon />}>
              <CheckIcon />
            </TreeViewNodeCheckboxIndicator>
          )}
        </>
      )}
    </TreeViewPrimitive.NodeCheckbox>
  )
}

function TreeViewNodeCheckboxIndicator({ ...props }: TreeViewNodeCheckboxIndicatorProps) {
  return <TreeViewPrimitive.NodeCheckboxIndicator data-slot="tree-view-node-checkbox-indicator" {...props} />
}

function TreeViewNodeRenameInput({ className, ...props }: TreeViewNodeRenameInputProps) {
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

function TreeViewRootProvider<T extends TreeNode>({ className, ...props }: TreeViewRootProviderProps<T>) {
  return <TreeViewPrimitive.RootProvider data-slot="tree-view" className={cn("w-full text-sm", className)} {...props} />
}

type TreeViewRootProps<T extends TreeNode = TreeNode> = React.ComponentProps<typeof TreeViewPrimitive.Root<T>>

type TreeViewRootProviderProps<T extends TreeNode = TreeNode> = React.ComponentProps<
  typeof TreeViewPrimitive.RootProvider<T>
>

type TreeViewBranchProps = React.ComponentProps<typeof TreeViewPrimitive.Branch>

type TreeViewBranchContentProps = React.ComponentProps<typeof TreeViewPrimitive.BranchContent>

type TreeViewBranchControlProps = React.ComponentProps<typeof TreeViewPrimitive.BranchControl>

type TreeViewBranchIndentGuideProps = React.ComponentProps<typeof TreeViewPrimitive.BranchIndentGuide>

type TreeViewBranchIndicatorProps = React.ComponentProps<typeof TreeViewPrimitive.BranchIndicator>

type TreeViewBranchTextProps = React.ComponentProps<typeof TreeViewPrimitive.BranchText>

type TreeViewBranchTriggerProps = React.ComponentProps<typeof TreeViewPrimitive.BranchTrigger>

type TreeViewContextProps = React.ComponentProps<typeof TreeViewPrimitive.Context>

type TreeViewItemProps = React.ComponentProps<typeof TreeViewPrimitive.Item>

type TreeViewItemIndicatorProps = React.ComponentProps<typeof TreeViewPrimitive.ItemIndicator>

type TreeViewItemTextProps = React.ComponentProps<typeof TreeViewPrimitive.ItemText>

type TreeViewLabelProps = React.ComponentProps<typeof TreeViewPrimitive.Label>

type TreeViewNodeCheckboxProps = React.ComponentProps<typeof TreeViewPrimitive.NodeCheckbox>

type TreeViewNodeCheckboxIndicatorProps = React.ComponentProps<typeof TreeViewPrimitive.NodeCheckboxIndicator>

type TreeViewNodeContextProps = React.ComponentProps<typeof TreeViewPrimitive.NodeContext>

type TreeViewNodeProviderProps<T = unknown> = React.ComponentProps<typeof TreeViewPrimitive.NodeProvider<T>>

type TreeViewNodeRenameInputProps = React.ComponentProps<typeof TreeViewPrimitive.NodeRenameInput>

type TreeViewTreeProps = React.ComponentProps<typeof TreeViewPrimitive.Tree>

const TreeView = {
  Root: TreeViewRoot,
  RootProvider: TreeViewRootProvider,
  Branch: TreeViewBranch,
  BranchContent: TreeViewBranchContent,
  BranchControl: TreeViewBranchControl,
  BranchIndentGuide: TreeViewBranchIndentGuide,
  BranchIndicator: TreeViewBranchIndicator,
  BranchText: TreeViewBranchText,
  BranchTrigger: TreeViewBranchTrigger,
  Context: TreeViewContext,
  Item: TreeViewItem,
  ItemIndicator: TreeViewItemIndicator,
  ItemText: TreeViewItemText,
  Label: TreeViewLabel,
  NodeCheckbox: TreeViewNodeCheckbox,
  NodeCheckboxIndicator: TreeViewNodeCheckboxIndicator,
  NodeContext: TreeViewNodeContext,
  NodeProvider: TreeViewNodeProvider,
  NodeRenameInput: TreeViewNodeRenameInput,
  Tree: TreeViewTree,
}

export {
  useTreeView,
  useTreeViewContext,
  useTreeViewNodeContext,
  TreeView,
  createTreeCollection,
  type TreeCollection,
  type TreeNode,
  type TreeViewRootProps,
  type TreeViewRootProviderProps,
  type TreeViewBranchProps,
  type TreeViewBranchContentProps,
  type TreeViewBranchControlProps,
  type TreeViewBranchIndentGuideProps,
  type TreeViewBranchIndicatorProps,
  type TreeViewBranchTextProps,
  type TreeViewBranchTriggerProps,
  type TreeViewContextProps,
  type TreeViewItemProps,
  type TreeViewItemIndicatorProps,
  type TreeViewItemTextProps,
  type TreeViewLabelProps,
  type TreeViewNodeCheckboxProps,
  type TreeViewNodeCheckboxIndicatorProps,
  type TreeViewNodeContextProps,
  type TreeViewNodeProviderProps,
  type TreeViewNodeRenameInputProps,
  type TreeViewTreeProps,
}
