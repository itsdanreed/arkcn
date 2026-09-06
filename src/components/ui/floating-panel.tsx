"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FloatingPanel as FloatingPanelPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"
import { Maximize2Icon, Minimize2Icon, MinusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function FloatingPanel({
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.Root>) {
  return <FloatingPanelPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function FloatingPanelContext({ ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Context>) {
  return <FloatingPanelPrimitive.Context {...props} />
}

function FloatingPanelTrigger({ ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Trigger>) {
  return <FloatingPanelPrimitive.Trigger data-slot="floating-panel-trigger" {...props} />
}

function FloatingPanelPortal({ ...props }: React.ComponentProps<typeof PortalPrimitive>) {
  return <PortalPrimitive {...props} />
}

function FloatingPanelPositioner({
  className,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.Positioner>) {
  return (
    <FloatingPanelPrimitive.Positioner
      data-slot="floating-panel-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function FloatingPanelContent({ className, ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Content>) {
  return (
    <FloatingPanelPortal>
      <FloatingPanelPositioner>
        <FloatingPanelPrimitive.Content
          data-slot="floating-panel-content"
          className={cn(
            "flex flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden data-[stage=minimized]:h-auto data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </FloatingPanelPositioner>
    </FloatingPanelPortal>
  )
}

function FloatingPanelDragTrigger({
  className,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.DragTrigger>) {
  return (
    <FloatingPanelPrimitive.DragTrigger
      data-slot="floating-panel-drag-trigger"
      className={cn("flex-1 cursor-grab select-none data-dragging:cursor-grabbing", className)}
      {...props}
    />
  )
}

function FloatingPanelHeader({ className, ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Header>) {
  return (
    <FloatingPanelPrimitive.Header
      data-slot="floating-panel-header"
      className={cn("flex h-9 items-center gap-1 border-b bg-muted/50 pr-1 pl-3", className)}
      {...props}
    />
  )
}

function FloatingPanelTitle({ className, ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Title>) {
  return (
    <FloatingPanelPrimitive.Title
      data-slot="floating-panel-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

function FloatingPanelControl({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.Control>) {
  return (
    <FloatingPanelPrimitive.Control
      data-slot="floating-panel-control"
      className={cn("flex items-center", className)}
      {...props}
    >
      {children ?? (
        <>
          <FloatingPanelStageTrigger stage="minimized">
            <MinusIcon />
          </FloatingPanelStageTrigger>
          <FloatingPanelStageTrigger stage="maximized">
            <Maximize2Icon />
          </FloatingPanelStageTrigger>
          <FloatingPanelStageTrigger stage="default">
            <Minimize2Icon />
          </FloatingPanelStageTrigger>
          <FloatingPanelCloseTrigger />
        </>
      )}
    </FloatingPanelPrimitive.Control>
  )
}

function FloatingPanelStageTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.StageTrigger>) {
  return (
    <FloatingPanelPrimitive.StageTrigger
      data-slot="floating-panel-stage-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="icon-xs">
        {children}
      </Button>
    </FloatingPanelPrimitive.StageTrigger>
  )
}

function FloatingPanelCloseTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.CloseTrigger>) {
  return (
    <FloatingPanelPrimitive.CloseTrigger
      data-slot="floating-panel-close-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="icon-xs">
        {children ?? <XIcon />}
        <span className="sr-only">Close</span>
      </Button>
    </FloatingPanelPrimitive.CloseTrigger>
  )
}

function FloatingPanelBody({ className, ...props }: React.ComponentProps<typeof FloatingPanelPrimitive.Body>) {
  return (
    <FloatingPanelPrimitive.Body
      data-slot="floating-panel-body"
      className={cn("flex-1 overflow-auto p-3", className)}
      {...props}
    />
  )
}

function FloatingPanelResizeTrigger({
  className,
  ...props
}: React.ComponentProps<typeof FloatingPanelPrimitive.ResizeTrigger>) {
  return (
    <FloatingPanelPrimitive.ResizeTrigger
      data-slot="floating-panel-resize-trigger"
      className={cn(className)}
      {...props}
    />
  )
}

export {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelCloseTrigger,
  FloatingPanelContent,
  FloatingPanelContext,
  FloatingPanelControl,
  FloatingPanelDragTrigger,
  FloatingPanelHeader,
  FloatingPanelPortal,
  FloatingPanelPositioner,
  FloatingPanelResizeTrigger,
  FloatingPanelStageTrigger,
  FloatingPanelTitle,
  FloatingPanelTrigger,
}
