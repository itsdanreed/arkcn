import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"

function TableRoot({ className, ...props }: TableRootProps) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <ark.table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <ark.thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}

function TableBody({ className, ...props }: TableBodyProps) {
  return <ark.tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <ark.tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <ark.tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <ark.th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground has-[[role=checkbox]]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <ark.td
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <ark.caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
}

type TableRootProps = React.ComponentProps<typeof ark.table>

type TableHeaderProps = React.ComponentProps<typeof ark.thead>

type TableBodyProps = React.ComponentProps<typeof ark.tbody>

type TableFooterProps = React.ComponentProps<typeof ark.tfoot>

type TableHeadProps = React.ComponentProps<typeof ark.th>

type TableRowProps = React.ComponentProps<typeof ark.tr>

type TableCellProps = React.ComponentProps<typeof ark.td>

type TableCaptionProps = React.ComponentProps<typeof ark.caption>

const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
}

export {
  Table,
  type TableRootProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableHeadProps,
  type TableRowProps,
  type TableCellProps,
  type TableCaptionProps,
}
