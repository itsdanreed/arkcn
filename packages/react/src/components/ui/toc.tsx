"use client"

import { useToc, useTocContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { Toc as TocPrimitive } from "@ark-ui/react"

function TocRoot({ className, ...props }: TocRootProps) {
  return <TocPrimitive.Root data-slot="toc" className={cn("w-full text-sm", className)} {...props} />
}

function TocContext({ ...props }: TocContextProps) {
  return <TocPrimitive.Context {...props} />
}

function TocNav({ className, ...props }: TocNavProps) {
  return <TocPrimitive.Nav data-slot="toc-nav" className={cn("flex flex-col gap-2 p-4 pt-0", className)} {...props} />
}

function TocTitle({ className, ...props }: TocTitleProps) {
  return (
    <TocPrimitive.Title
      data-slot="toc-title"
      className={cn("h-6 bg-background text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function TocContent({ className, ...props }: TocContentProps) {
  return <TocPrimitive.Content data-slot="toc-content" className={cn("relative", className)} {...props} />
}

function TocList({ className, ...props }: TocListProps) {
  return <TocPrimitive.List data-slot="toc-list" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TocItem({ className, ...props }: TocItemProps) {
  return <TocPrimitive.Item data-slot="toc-item" className={cn("flex min-w-0", className)} {...props} />
}

function TocLink({ className, ...props }: TocLinkProps) {
  return (
    <TocPrimitive.Link
      data-slot="toc-link"
      className={cn(
        "min-w-0 flex-1 ps-[max(0px,calc((var(--depth,2)-1)*(--spacing(2))))] text-[0.8rem] wrap-break-word text-muted-foreground no-underline transition-colors hover:text-foreground in-data-[depth=2]:ps-0 motion-reduce:transition-none data-active:font-medium data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TocIndicator({ className, ...props }: TocIndicatorProps) {
  return (
    <TocPrimitive.Indicator
      data-slot="toc-indicator"
      className={cn(
        "inset-s-[-8px] top-(--top) h-(--height) w-px bg-foreground transition-[top,height] motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function TocRootProvider({ className, ...props }: TocRootProviderProps) {
  return <TocPrimitive.RootProvider data-slot="toc" className={cn("w-full text-sm", className)} {...props} />
}

type TocRootProps = React.ComponentProps<typeof TocPrimitive.Root>

type TocRootProviderProps = React.ComponentProps<typeof TocPrimitive.RootProvider>

type TocContentProps = React.ComponentProps<typeof TocPrimitive.Content>

type TocContextProps = React.ComponentProps<typeof TocPrimitive.Context>

type TocIndicatorProps = React.ComponentProps<typeof TocPrimitive.Indicator>

type TocItemProps = React.ComponentProps<typeof TocPrimitive.Item>

type TocLinkProps = React.ComponentProps<typeof TocPrimitive.Link>

type TocListProps = React.ComponentProps<typeof TocPrimitive.List>

type TocNavProps = React.ComponentProps<typeof TocPrimitive.Nav>

type TocTitleProps = React.ComponentProps<typeof TocPrimitive.Title>

const Toc = {
  Root: TocRoot,
  RootProvider: TocRootProvider,
  Content: TocContent,
  Context: TocContext,
  Indicator: TocIndicator,
  Item: TocItem,
  Link: TocLink,
  List: TocList,
  Nav: TocNav,
  Title: TocTitle,
}

export {
  useToc,
  useTocContext,
  Toc,
  type TocRootProps,
  type TocRootProviderProps,
  type TocContentProps,
  type TocContextProps,
  type TocIndicatorProps,
  type TocItemProps,
  type TocLinkProps,
  type TocListProps,
  type TocNavProps,
  type TocTitleProps,
}
