"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Marquee as MarqueePrimitive } from "@ark-ui/react"

function Marquee({ className, ...props }: React.ComponentProps<typeof MarqueePrimitive.Root>) {
  return (
    <MarqueePrimitive.Root
      data-slot="marquee"
      className={cn("group/marquee relative w-full overflow-hidden", className)}
      {...props}
    />
  )
}

function MarqueeContext({ ...props }: React.ComponentProps<typeof MarqueePrimitive.Context>) {
  return <MarqueePrimitive.Context {...props} />
}

function MarqueeViewport({ className, ...props }: React.ComponentProps<typeof MarqueePrimitive.Viewport>) {
  return (
    <MarqueePrimitive.Viewport
      data-slot="marquee-viewport"
      className={cn("flex w-full overflow-hidden", className)}
      {...props}
    />
  )
}

function MarqueeContent({ className, ...props }: React.ComponentProps<typeof MarqueePrimitive.Content>) {
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

function MarqueeItem({ className, ...props }: React.ComponentProps<typeof MarqueePrimitive.Item>) {
  return <MarqueePrimitive.Item data-slot="marquee-item" className={cn("shrink-0", className)} {...props} />
}

function MarqueeEdge({ className, ...props }: React.ComponentProps<typeof MarqueePrimitive.Edge>) {
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

export { Marquee, MarqueeContent, MarqueeContext, MarqueeEdge, MarqueeItem, MarqueeViewport }
