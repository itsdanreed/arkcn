"use client"
import * as React from "react"
import { Splitter as SplitterPrimitive, useSplitter, useSplitterContext, createSplitterRegistry } from "@ark-ui/react"
import { cn } from "../../lib/utils"

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
  const { orientation } = useSplitterContext()
  return (
    <SplitterPrimitive.ResizeTrigger
      data-slot="splitter-resize-trigger"
      aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
      aria-disabled={props.disabled || undefined}
      className={cn(
        "relative flex w-px shrink-0 items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden data-vertical:h-px data-vertical:w-full data-vertical:after:left-0 data-vertical:after:h-1 data-vertical:after:w-full data-vertical:after:translate-x-0 data-vertical:after:-translate-y-1/2",
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
      className={cn("z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border data-vertical:rotate-90", className)}
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
