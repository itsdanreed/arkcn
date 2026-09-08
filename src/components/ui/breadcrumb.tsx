import * as React from "react"
import { cn } from "@/lib/utils"
import { ark } from "@ark-ui/react"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function BreadcrumbRoot({ className, ...props }: BreadcrumbRootProps) {
  return <ark.nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(className)} {...props} />
}

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ark.ol
      data-slot="breadcrumb-list"
      className={cn("flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return <ark.li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1", className)} {...props} />
}

function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = ark.a

  return (
    <Comp
      asChild={asChild}
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <ark.span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <ark.li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <ChevronRightIcon />}</>}
    </ark.li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <ark.span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-5 items-center justify-center [&>svg]:size-4", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <MoreHorizontalIcon />
          <span className="sr-only">More</span>
        </>
      )}
    </ark.span>
  )
}

type BreadcrumbRootProps = React.ComponentProps<typeof ark.nav>

type BreadcrumbListProps = React.ComponentProps<typeof ark.ol>

type BreadcrumbItemProps = React.ComponentProps<typeof ark.li>

type BreadcrumbLinkProps = React.ComponentProps<typeof ark.a> & {
  asChild?: boolean
}

type BreadcrumbPageProps = React.ComponentProps<typeof ark.span>

type BreadcrumbSeparatorProps = React.ComponentProps<typeof ark.li>

type BreadcrumbEllipsisProps = React.ComponentProps<typeof ark.span>

const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
}

export {
  Breadcrumb,
  type BreadcrumbRootProps,
  type BreadcrumbListProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbPageProps,
  type BreadcrumbSeparatorProps,
  type BreadcrumbEllipsisProps,
}
