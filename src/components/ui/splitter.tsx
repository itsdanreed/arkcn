"use client"
import * as React from "react"
import { Splitter as SplitterPrimitive, useSplitter, useSplitterContext, createSplitterRegistry } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function SplitterContext(props: SplitterContextProps) {
  return <SplitterPrimitive.Context {...props} />
}

function SplitterPanel({ className, ...props }: SplitterPanelProps) {
  return (
    <SplitterPrimitive.Panel
      data-slot="splitter-panel"
      className={cn("min-h-0 min-w-0 overflow-auto", className)}
      {...props}
    />
  )
}

function SplitterResizeTrigger({ className, ...props }: SplitterResizeTriggerProps) {
  return (
    <SplitterPrimitive.ResizeTrigger
      data-slot="splitter-resize-trigger"
      className={cn(
        "relative flex w-1 shrink-0 items-center justify-center bg-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-vertical:h-1 data-vertical:w-full",
        className
      )}
      {...props}
    />
  )
}

function SplitterResizeTriggerIndicator({ className, ...props }: SplitterResizeTriggerIndicatorProps) {
  return (
    <SplitterPrimitive.ResizeTriggerIndicator
      data-slot="splitter-resize-trigger-indicator"
      className={cn("h-6 w-1 rounded-full bg-muted-foreground/50 data-vertical:h-1 data-vertical:w-6", className)}
      {...props}
    />
  )
}

function SplitterRoot({ className, ...props }: SplitterRootProps) {
  return (
    <SplitterPrimitive.Root
      data-slot="splitter"
      className={cn("flex size-full data-vertical:flex-col", className)}
      {...props}
    />
  )
}

function SplitterRootProvider({ className, ...props }: SplitterRootProviderProps) {
  return (
    <SplitterPrimitive.RootProvider
      data-slot="splitter-root-provider"
      className={cn("flex size-full data-vertical:flex-col", className)}
      {...props}
    />
  )
}

const SplitterGetLayout = SplitterPrimitive.getLayout

type SplitterRootProps = React.ComponentProps<typeof SplitterPrimitive.Root>

type SplitterContextProps = React.ComponentProps<typeof SplitterPrimitive.Context>

type SplitterPanelProps = React.ComponentProps<typeof SplitterPrimitive.Panel>

type SplitterResizeTriggerProps = React.ComponentProps<typeof SplitterPrimitive.ResizeTrigger>

type SplitterResizeTriggerIndicatorProps = React.ComponentProps<typeof SplitterPrimitive.ResizeTriggerIndicator>

type SplitterRootProviderProps = React.ComponentProps<typeof SplitterPrimitive.RootProvider>

const Splitter = {
  getLayout: SplitterGetLayout,
  Root: SplitterRoot,
  Context: SplitterContext,
  Panel: SplitterPanel,
  ResizeTrigger: SplitterResizeTrigger,
  ResizeTriggerIndicator: SplitterResizeTriggerIndicator,
  RootProvider: SplitterRootProvider,
  createRegistry: createSplitterRegistry,
}

export {
  Splitter,
  useSplitter,
  useSplitterContext,
  createSplitterRegistry,
  type SplitterRootProps,
  type SplitterContextProps,
  type SplitterPanelProps,
  type SplitterResizeTriggerProps,
  type SplitterResizeTriggerIndicatorProps,
  type SplitterRootProviderProps,
}
