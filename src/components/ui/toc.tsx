"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Toc as TocPrimitive } from "@ark-ui/react"

function Toc({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Root>) {
  return <TocPrimitive.Root data-slot="toc" className={cn("w-full text-sm", className)} {...props} />
}

function TocContext({ ...props }: React.ComponentProps<typeof TocPrimitive.Context>) {
  return <TocPrimitive.Context {...props} />
}

function TocNav({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Nav>) {
  return <TocPrimitive.Nav data-slot="toc-nav" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TocTitle({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Title>) {
  return (
    <TocPrimitive.Title
      data-slot="toc-title"
      className={cn("text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function TocContent({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Content>) {
  return <TocPrimitive.Content data-slot="toc-content" className={cn("relative", className)} {...props} />
}

function TocList({ className, ...props }: React.ComponentProps<typeof TocPrimitive.List>) {
  return <TocPrimitive.List data-slot="toc-list" className={cn("flex flex-col border-l", className)} {...props} />
}

function TocItem({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Item>) {
  return <TocPrimitive.Item data-slot="toc-item" className={cn("flex", className)} {...props} />
}

function TocLink({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Link>) {
  return (
    <TocPrimitive.Link
      data-slot="toc-link"
      className={cn(
        "-ml-px flex-1 border-l border-transparent py-1 pl-[calc(var(--depth,1)*(--spacing(3)))] text-muted-foreground transition-colors hover:text-foreground data-active:border-foreground data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TocIndicator({ className, ...props }: React.ComponentProps<typeof TocPrimitive.Indicator>) {
  return (
    <TocPrimitive.Indicator
      data-slot="toc-indicator"
      className={cn("w-px bg-foreground transition-all", className)}
      {...props}
    />
  )
}

export { Toc, TocContent, TocContext, TocIndicator, TocItem, TocLink, TocList, TocNav, TocTitle }
