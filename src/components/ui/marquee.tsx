"use client"

import { useMarquee, useMarqueeContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Marquee as MarqueePrimitive } from "@ark-ui/react"

function MarqueeRoot({ className, ...props }: MarqueeRootProps) {
  return (
    <MarqueePrimitive.Root
      data-slot="marquee"
      className={cn("group/marquee relative w-full overflow-hidden", className)}
      {...props}
    />
  )
}

function MarqueeContext({ ...props }: MarqueeContextProps) {
  return <MarqueePrimitive.Context {...props} />
}

function MarqueeViewport({ className, ...props }: MarqueeViewportProps) {
  return (
    <MarqueePrimitive.Viewport
      data-slot="marquee-viewport"
      className={cn("flex w-full overflow-hidden", className)}
      {...props}
    />
  )
}

function MarqueeContent({ className, ...props }: MarqueeContentProps) {
  return (
    <MarqueePrimitive.Content
      data-slot="marquee-content"
      className={cn(
        "flex shrink-0 items-center group-data-paused/marquee:paused data-reverse:shimmer-reverse data-horizontal:animate-marquee-x data-vertical:animate-marquee-y",
        className
      )}
      {...props}
    />
  )
}

function MarqueeItem({ className, ...props }: MarqueeItemProps) {
  return <MarqueePrimitive.Item data-slot="marquee-item" className={cn("shrink-0", className)} {...props} />
}

function MarqueeEdge({ className, ...props }: MarqueeEdgeProps) {
  return (
    <MarqueePrimitive.Edge
      data-slot="marquee-edge"
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 w-12 from-background to-transparent data-[side=end]:right-0 data-[side=end]:bg-linear-to-l data-[side=start]:left-0 data-[side=start]:bg-linear-to-r",
        className
      )}
      {...props}
    />
  )
}

function MarqueeRootProvider({ className, ...props }: MarqueeRootProviderProps) {
  return (
    <MarqueePrimitive.RootProvider
      data-slot="marquee"
      className={cn("group/marquee relative w-full overflow-hidden", className)}
      {...props}
    />
  )
}

type MarqueeRootProps = React.ComponentProps<typeof MarqueePrimitive.Root>

type MarqueeRootProviderProps = React.ComponentProps<typeof MarqueePrimitive.RootProvider>

type MarqueeContentProps = React.ComponentProps<typeof MarqueePrimitive.Content>

type MarqueeContextProps = React.ComponentProps<typeof MarqueePrimitive.Context>

type MarqueeEdgeProps = React.ComponentProps<typeof MarqueePrimitive.Edge>

type MarqueeItemProps = React.ComponentProps<typeof MarqueePrimitive.Item>

type MarqueeViewportProps = React.ComponentProps<typeof MarqueePrimitive.Viewport>

const Marquee = {
  Root: MarqueeRoot,
  RootProvider: MarqueeRootProvider,
  Content: MarqueeContent,
  Context: MarqueeContext,
  Edge: MarqueeEdge,
  Item: MarqueeItem,
  Viewport: MarqueeViewport,
}

export {
  useMarquee,
  useMarqueeContext,
  Marquee,
  type MarqueeRootProps,
  type MarqueeRootProviderProps,
  type MarqueeContentProps,
  type MarqueeContextProps,
  type MarqueeEdgeProps,
  type MarqueeItemProps,
  type MarqueeViewportProps,
}
