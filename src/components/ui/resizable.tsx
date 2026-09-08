"use client"

import { cn } from "@/lib/utils"
import * as ResizablePrimitive from "react-resizable-panels"

function ResizableRoot({ className, ...props }: ResizableRootProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn("flex size-full aria-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />}
    </ResizablePrimitive.Separator>
  )
}

type ResizableRootProps = ResizablePrimitive.GroupProps

type ResizableHandleProps = ResizablePrimitive.SeparatorProps & {
  /** Render a visible grip on the handle. */
  withHandle?: boolean
}

type ResizablePanelProps = ResizablePrimitive.PanelProps

const Resizable = {
  Root: ResizableRoot,
  Handle: ResizableHandle,
  Panel: ResizablePanel,
}

export { Resizable, type ResizableRootProps, type ResizableHandleProps, type ResizablePanelProps }
