"use client"

import { useFloatingPanel, useFloatingPanelContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { FloatingPanel as FloatingPanelPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"
import { Maximize2Icon, Minimize2Icon, MinusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function FloatingPanelRoot({ lazyMount = true, unmountOnExit = true, ...props }: FloatingPanelRootProps) {
  return <FloatingPanelPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function FloatingPanelContext({ ...props }: FloatingPanelContextProps) {
  return <FloatingPanelPrimitive.Context {...props} />
}

function FloatingPanelTrigger({ ...props }: FloatingPanelTriggerProps) {
  return <FloatingPanelPrimitive.Trigger data-slot="floating-panel-trigger" {...props} />
}

function FloatingPanelPortal({ ...props }: FloatingPanelPortalProps) {
  return <PortalPrimitive {...props} />
}

function FloatingPanelPositioner({ className, ...props }: FloatingPanelPositionerProps) {
  return (
    <FloatingPanelPrimitive.Positioner
      data-slot="floating-panel-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function FloatingPanelContent({ className, ...props }: FloatingPanelContentProps) {
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

function FloatingPanelDragTrigger({ className, ...props }: FloatingPanelDragTriggerProps) {
  return (
    <FloatingPanelPrimitive.DragTrigger
      data-slot="floating-panel-drag-trigger"
      className={cn("flex-1 cursor-grab select-none data-dragging:cursor-grabbing", className)}
      {...props}
    />
  )
}

function FloatingPanelHeader({ className, ...props }: FloatingPanelHeaderProps) {
  return (
    <FloatingPanelPrimitive.Header
      data-slot="floating-panel-header"
      className={cn("flex h-9 items-center gap-1 border-b bg-muted/50 pr-1 pl-3", className)}
      {...props}
    />
  )
}

function FloatingPanelTitle({ className, ...props }: FloatingPanelTitleProps) {
  return (
    <FloatingPanelPrimitive.Title
      data-slot="floating-panel-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

function FloatingPanelControl({ className, children, ...props }: FloatingPanelControlProps) {
  return (
    <FloatingPanelPrimitive.Control
      data-slot="floating-panel-control"
      className={cn("flex items-center", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
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
        </>
      )}
    </FloatingPanelPrimitive.Control>
  )
}

function FloatingPanelStageTrigger({ className, children, ...props }: FloatingPanelStageTriggerProps) {
  return (
    <FloatingPanelPrimitive.StageTrigger
      data-slot="floating-panel-stage-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="icon-xs">
            {children}
          </Button>
        </>
      )}
    </FloatingPanelPrimitive.StageTrigger>
  )
}

function FloatingPanelCloseTrigger({ className, children, ...props }: FloatingPanelCloseTriggerProps) {
  return (
    <FloatingPanelPrimitive.CloseTrigger
      data-slot="floating-panel-close-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="icon-xs">
            {children ?? <XIcon />}
            <span className="sr-only">Close</span>
          </Button>
        </>
      )}
    </FloatingPanelPrimitive.CloseTrigger>
  )
}

function FloatingPanelBody({ className, ...props }: FloatingPanelBodyProps) {
  return (
    <FloatingPanelPrimitive.Body
      data-slot="floating-panel-body"
      className={cn("flex-1 overflow-auto p-3", className)}
      {...props}
    />
  )
}

function FloatingPanelResizeTrigger({ className, ...props }: FloatingPanelResizeTriggerProps) {
  return (
    <FloatingPanelPrimitive.ResizeTrigger
      data-slot="floating-panel-resize-trigger"
      className={cn(className)}
      {...props}
    />
  )
}

function FloatingPanelRootProvider(props: FloatingPanelRootProviderProps) {
  return <FloatingPanelPrimitive.RootProvider {...props} />
}

type FloatingPanelRootProps = React.ComponentProps<typeof FloatingPanelPrimitive.Root>

type FloatingPanelRootProviderProps = React.ComponentProps<typeof FloatingPanelPrimitive.RootProvider>

type FloatingPanelBodyProps = React.ComponentProps<typeof FloatingPanelPrimitive.Body>

type FloatingPanelCloseTriggerProps = React.ComponentProps<typeof FloatingPanelPrimitive.CloseTrigger>

type FloatingPanelContentProps = React.ComponentProps<typeof FloatingPanelPrimitive.Content>

type FloatingPanelContextProps = React.ComponentProps<typeof FloatingPanelPrimitive.Context>

type FloatingPanelControlProps = React.ComponentProps<typeof FloatingPanelPrimitive.Control>

type FloatingPanelDragTriggerProps = React.ComponentProps<typeof FloatingPanelPrimitive.DragTrigger>

type FloatingPanelHeaderProps = React.ComponentProps<typeof FloatingPanelPrimitive.Header>

type FloatingPanelPortalProps = React.ComponentProps<typeof PortalPrimitive>

type FloatingPanelPositionerProps = React.ComponentProps<typeof FloatingPanelPrimitive.Positioner>

type FloatingPanelResizeTriggerProps = React.ComponentProps<typeof FloatingPanelPrimitive.ResizeTrigger>

type FloatingPanelStageTriggerProps = React.ComponentProps<typeof FloatingPanelPrimitive.StageTrigger>

type FloatingPanelTitleProps = React.ComponentProps<typeof FloatingPanelPrimitive.Title>

type FloatingPanelTriggerProps = React.ComponentProps<typeof FloatingPanelPrimitive.Trigger>

const FloatingPanel = {
  Root: FloatingPanelRoot,
  RootProvider: FloatingPanelRootProvider,
  Body: FloatingPanelBody,
  CloseTrigger: FloatingPanelCloseTrigger,
  Content: FloatingPanelContent,
  Context: FloatingPanelContext,
  Control: FloatingPanelControl,
  DragTrigger: FloatingPanelDragTrigger,
  Header: FloatingPanelHeader,
  Portal: FloatingPanelPortal,
  Positioner: FloatingPanelPositioner,
  ResizeTrigger: FloatingPanelResizeTrigger,
  StageTrigger: FloatingPanelStageTrigger,
  Title: FloatingPanelTitle,
  Trigger: FloatingPanelTrigger,
}

export {
  useFloatingPanel,
  useFloatingPanelContext,
  FloatingPanel,
  type FloatingPanelRootProps,
  type FloatingPanelRootProviderProps,
  type FloatingPanelBodyProps,
  type FloatingPanelCloseTriggerProps,
  type FloatingPanelContentProps,
  type FloatingPanelContextProps,
  type FloatingPanelControlProps,
  type FloatingPanelDragTriggerProps,
  type FloatingPanelHeaderProps,
  type FloatingPanelPortalProps,
  type FloatingPanelPositionerProps,
  type FloatingPanelResizeTriggerProps,
  type FloatingPanelStageTriggerProps,
  type FloatingPanelTitleProps,
  type FloatingPanelTriggerProps,
}
