import { Pagination as PaginationPrimitive, usePagination, usePaginationContext } from "@ark-ui/react"
import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

function PaginationContent({ className, ...props }: PaginationContentProps) {
  return <ark.ul data-slot="pagination-content" className={cn("flex items-center gap-0.5", className)} {...props} />
}

type PaginationLinkProps = {
  /** Marks the current page link. */
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<typeof ark.a>

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <Button asChild variant={isActive ? "outline" : "ghost"} size={size} className={cn(className)}>
      <ark.a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}

function PaginationPrevious({ className, text = "Previous", ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn("pl-1.5!", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <ChevronLeftIcon data-icon="inline-start" />
          <span className="hidden sm:block">{text}</span>
        </>
      )}
    </PaginationLink>
  )
}

function PaginationNext({ className, text = "Next", ...props }: PaginationNextProps) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn("pr-1.5!", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <span className="hidden sm:block">{text}</span>
          <ChevronRightIcon data-icon="inline-end" />
        </>
      )}
    </PaginationLink>
  )
}

function PaginationRoot({ className, ...props }: PaginationRootProps) {
  return (
    <PaginationPrimitive.Root
      data-slot="pagination-root"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    />
  )
}
function PaginationRootProvider({ className, ...props }: PaginationRootProviderProps) {
  return (
    <PaginationPrimitive.RootProvider
      data-slot="pagination-root-provider"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    />
  )
}
function PaginationContext(props: PaginationContextProps) {
  return <PaginationPrimitive.Context {...props} />
}
function PaginationItem({ className, ...props }: PaginationItemProps) {
  return (
    <PaginationPrimitive.Item
      data-slot="pagination-item"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <PaginationPrimitive.Ellipsis
      data-slot="pagination-ellipsis"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
function PaginationFirstTrigger({ className, ...props }: PaginationFirstTriggerProps) {
  return (
    <PaginationPrimitive.FirstTrigger
      data-slot="pagination-first-trigger"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
function PaginationLastTrigger({ className, ...props }: PaginationLastTriggerProps) {
  return (
    <PaginationPrimitive.LastTrigger
      data-slot="pagination-last-trigger"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
function PaginationNextTrigger({ className, ...props }: PaginationNextTriggerProps) {
  return (
    <PaginationPrimitive.NextTrigger
      data-slot="pagination-next-trigger"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
function PaginationPrevTrigger({ className, ...props }: PaginationPrevTriggerProps) {
  return (
    <PaginationPrimitive.PrevTrigger
      data-slot="pagination-prev-trigger"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border data-selected:border-input data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

type PaginationRootProps = React.ComponentProps<typeof PaginationPrimitive.Root>

type PaginationRootProviderProps = React.ComponentProps<typeof PaginationPrimitive.RootProvider>

type PaginationContextProps = React.ComponentProps<typeof PaginationPrimitive.Context>

type PaginationFirstTriggerProps = React.ComponentProps<typeof PaginationPrimitive.FirstTrigger>

type PaginationLastTriggerProps = React.ComponentProps<typeof PaginationPrimitive.LastTrigger>

type PaginationNextTriggerProps = React.ComponentProps<typeof PaginationPrimitive.NextTrigger>

type PaginationPrevTriggerProps = React.ComponentProps<typeof PaginationPrimitive.PrevTrigger>

type PaginationContentProps = React.ComponentProps<typeof ark.ul>

type PaginationEllipsisProps = React.ComponentProps<typeof PaginationPrimitive.Ellipsis>

type PaginationItemProps = React.ComponentProps<typeof PaginationPrimitive.Item>

type PaginationNextProps = React.ComponentProps<typeof PaginationLink> & { text?: string }

type PaginationPreviousProps = React.ComponentProps<typeof PaginationLink> & { text?: string }

const Pagination = {
  Root: PaginationRoot,
  RootProvider: PaginationRootProvider,
  Context: PaginationContext,
  FirstTrigger: PaginationFirstTrigger,
  LastTrigger: PaginationLastTrigger,
  NextTrigger: PaginationNextTrigger,
  PrevTrigger: PaginationPrevTrigger,
  Content: PaginationContent,
  Ellipsis: PaginationEllipsis,
  Item: PaginationItem,
  Link: PaginationLink,
  Next: PaginationNext,
  Previous: PaginationPrevious,
}

export {
  usePagination,
  usePaginationContext,
  Pagination,
  type PaginationRootProps,
  type PaginationRootProviderProps,
  type PaginationContextProps,
  type PaginationFirstTriggerProps,
  type PaginationLastTriggerProps,
  type PaginationNextTriggerProps,
  type PaginationPrevTriggerProps,
  type PaginationContentProps,
  type PaginationEllipsisProps,
  type PaginationItemProps,
  type PaginationLinkProps,
  type PaginationNextProps,
  type PaginationPreviousProps,
}
