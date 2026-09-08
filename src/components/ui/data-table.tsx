"use client"

import { ark } from "@ark-ui/react"
import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type VisibilityState,
  useTable,
} from "@/lib/table"
import {
  type DataTableColumn,
  type DataTableInstance,
  type DataTableRow as DataTableRowInstance,
} from "@/lib/data-table-adapter"
import {
  MinusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
  EyeOffIcon,
  PlusCircleIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, useFilter, useListCollection } from "@/components/ui/command"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover } from "@/components/ui/popover"
import { Select, createListCollection } from "@/components/ui/select"
import { FloatingToolbar } from "@/components/ui/floating-toolbar"
import { Separator } from "@/components/ui/separator"
import { Table } from "@/components/ui/table"
import { Tooltip } from "@/components/ui/tooltip"

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The built-in adapter: the dependency-free engine from `@/lib/table`. Its
 * instance satisfies `DataTableInstance`, so it can be passed to `<DataTable>`
 * directly. Any other object implementing `DataTableInstance` works the same way.
 */
function useDataTable<TData>(options: TableOptions<TData>) {
  return useTable<TData>(options)
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTableContext = React.createContext<DataTableInstance<any> | null>(null)

function useDataTableContext<TData>(explicit?: DataTableInstance<TData>): DataTableInstance<TData> {
  const fromContext = React.useContext(DataTableContext)
  const table = explicit ?? fromContext
  if (!table) {
    throw new Error("Data table parts must be rendered inside <DataTable> or receive a `table` prop.")
  }
  return table
}

function DataTableRoot<TData>({ table, className, ...props }: DataTableRootProps<TData>) {
  return (
    <DataTableContext.Provider value={table}>
      <ark.div data-slot="data-table" className={cn("flex flex-1 flex-col gap-4", className)} {...props} />
    </DataTableContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                   */
/* -------------------------------------------------------------------------- */

function DataTableToolbar({ className, ...props }: DataTableToolbarProps) {
  return (
    <ark.div
      data-slot="data-table-toolbar"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function DataTableToolbarGroup({ className, ...props }: DataTableToolbarGroupProps) {
  return (
    <ark.div
      data-slot="data-table-toolbar-group"
      className={cn("flex flex-1 flex-col-reverse items-start gap-2 sm:flex-row sm:items-center", className)}
      {...props}
    />
  )
}

function DataTableSearch<TData>({ table: tableProp, columnId, className, ...props }: DataTableSearchProps<TData>) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  const value = columnId
    ? ((column?.getFilterValue() as string) ?? "")
    : ((table.getState().globalFilter as string) ?? "")
  return (
    <Input.Root
      data-slot="data-table-search"
      value={value}
      onChange={(event) =>
        columnId ? column?.setFilterValue(event.target.value) : table.setGlobalFilter(event.target.value)
      }
      className={cn("h-8 w-37.5 lg:w-62.5", className)}
      {...props}
    />
  )
}

function DataTableResetFilters<TData>({
  table: tableProp,
  className,
  children,
  asChild,
  ...props
}: DataTableResetFiltersProps<TData>) {
  const table = useDataTableContext(tableProp)
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
  if (!isFiltered) return null
  return (
    <Button
      data-slot="data-table-reset-filters"
      variant="ghost"
      size="sm"
      asChild={asChild}
      onClick={() => {
        table.resetColumnFilters()
        table.setGlobalFilter("")
      }}
      className={cn("h-8 px-2 lg:px-3", className)}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              Reset
              <XIcon />
            </>
          ))}
    </Button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Faceted filter                                                            */
/* -------------------------------------------------------------------------- */

type FacetOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

function DataTableFacetedFilter<TData, TValue>({
  table: tableProp,
  columnId,
  column: columnProp,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const table = useDataTableContext(tableProp)
  const column = columnProp ?? (columnId ? table.getColumn(columnId) : undefined)
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? [])

  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection<FacetOption>({
    initialItems: options,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    filter: contains,
  })

  const toggle = (value: string) => {
    const next = new Set(selectedValues)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    const values = Array.from(next)
    column?.setFilterValue(values.length ? values : undefined)
  }

  return (
    <Popover.Root positioning={{ placement: "bottom-start" }}>
      <Popover.Trigger asChild>
        <Button data-slot="data-table-faceted-filter-trigger" variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator.Root orientation="vertical" className="mx-1 h-4" />
              <Badge.Root variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge.Root>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge.Root variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge.Root>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge.Root key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge.Root>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content data-slot="data-table-faceted-filter-content" className="w-50 p-0">
        <Command.Root collection={collection} value={[]} onSelect={({ value }) => toggle(value)}>
          <Command.Input placeholder={title} onValueChange={filter} />
          <Command.Content>
            <Command.Empty>No results found.</Command.Empty>
            <Command.ItemGroup>
              {collection.items.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <Command.Item
                    key={option.value}
                    item={option}
                    className="**:data-[slot=command-item-indicator]:hidden"
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3.5" />
                    </div>
                    {option.icon && <option.icon className="size-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                    {facets?.get(option.value) ? (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    ) : null}
                  </Command.Item>
                )
              })}
            </Command.ItemGroup>
            {selectedValues.size > 0 && (
              <>
                <Command.Separator />
                <Command.ItemGroup>
                  <Command.Item
                    item={{ label: "Clear filters", value: "__clear__" }}
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center **:data-[slot=command-item-indicator]:hidden"
                  >
                    Clear filters
                  </Command.Item>
                </Command.ItemGroup>
              </>
            )}
          </Command.Content>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  )
}

/* -------------------------------------------------------------------------- */
/*  View options                                                              */
/* -------------------------------------------------------------------------- */

function DataTableViewOptions<TData>({ table: tableProp, className, children }: DataTableViewOptionsProps<TData>) {
  const table = useDataTableContext(tableProp)
  return (
    <DropdownMenu.Root positioning={{ placement: "bottom-end" }}>
      <DropdownMenu.Trigger asChild>
        <Button
          data-slot="data-table-view-options-trigger"
          variant="outline"
          size="sm"
          className={cn("ml-auto hidden h-8 lg:flex", className)}
        >
          <Settings2Icon />
          {children ?? "View"}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content data-slot="data-table-view-options-content" className="w-37.5">
        <DropdownMenu.ItemGroup>
          <DropdownMenu.ItemGroupLabel>Toggle columns</DropdownMenu.ItemGroupLabel>
          <DropdownMenu.Separator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => (
              <DropdownMenu.CheckboxItem
                key={column.id}
                value={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                closeOnSelect={false}
              >
                {column.label ?? column.id}
              </DropdownMenu.CheckboxItem>
            ))}
        </DropdownMenu.ItemGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

/* -------------------------------------------------------------------------- */
/*  Column header                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A header cell bound to a column id. Sortable columns get the sort/hide menu
 * with `children` as the title; hidden columns render nothing.
 */
function DataTableHead<TData>({
  column: columnId,
  table: tableProp,
  className,
  children,
  ...props
}: DataTableHeadProps<TData>) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  if (column && !column.getIsVisible()) return null
  if (!column?.getCanSort()) {
    return (
      <Table.Head data-slot="data-table-head" data-column={columnId} className={className} {...props}>
        {children}
      </Table.Head>
    )
  }
  const sorted = column.getIsSorted()
  return (
    <Table.Head data-slot="data-table-head" data-column={columnId} className={className} {...props}>
      <DropdownMenu.Root positioning={{ placement: "bottom-start" }}>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="sm" className="-ml-2.5 h-8 data-open:bg-accent">
            <span>{children}</span>
            {sorted === "desc" ? <ArrowDownIcon /> : sorted === "asc" ? <ArrowUpIcon /> : <ChevronsUpDownIcon />}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item value="asc" onSelect={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="text-muted-foreground/70" />
            Asc
          </DropdownMenu.Item>
          <DropdownMenu.Item value="desc" onSelect={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="text-muted-foreground/70" />
            Desc
          </DropdownMenu.Item>
          {column.getCanHide() && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item value="hide" onSelect={() => column.toggleVisibility(false)}>
                <EyeOffIcon className="text-muted-foreground/70" />
                Hide
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Table.Head>
  )
}

/* -------------------------------------------------------------------------- */
/*  Selection cells                                                           */
/* -------------------------------------------------------------------------- */

function DataTableSelectAll<TData>({ table, className, ...props }: DataTableSelectAllProps<TData>) {
  return (
    <Checkbox.Root
      data-slot="data-table-select-all"
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={({ checked }) => table.toggleAllPageRowsSelected(checked === true)}
      aria-label="Select all"
      className={cn("translate-y-0.5", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Checkbox.Control>
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>
              <MinusIcon />
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.HiddenInput />
        </>
      )}
    </Checkbox.Root>
  )
}

function DataTableSelectRow<TData>({ row, className, ...props }: DataTableSelectRowProps<TData>) {
  return (
    <Checkbox.Root
      data-slot="data-table-select-row"
      checked={row.getIsSelected()}
      onCheckedChange={({ checked }) => row.toggleSelected(checked === true)}
      aria-label="Select row"
      className={cn("translate-y-0.5", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Checkbox.Control>
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>
              <MinusIcon />
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.HiddenInput />
        </>
      )}
    </Checkbox.Root>
  )
}

/* -------------------------------------------------------------------------- */
/*  Row actions                                                               */
/* -------------------------------------------------------------------------- */

function DataTableRowActions({ children, className, trigger, ...props }: DataTableRowActionsProps) {
  return (
    <DropdownMenu.Root positioning={{ placement: "bottom-end" }} {...props}>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <Button
            data-slot="data-table-row-actions-trigger"
            variant="ghost"
            size="icon"
            className={cn("size-8 data-open:bg-muted", className)}
          >
            <EllipsisIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content data-slot="data-table-row-actions-content" className="w-40">
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

/* -------------------------------------------------------------------------- */
/*  Table rendering                                                           */
/* -------------------------------------------------------------------------- */

function DataTableContainer({ className, ...props }: DataTableContainerProps) {
  return (
    <ark.div
      data-slot="data-table-container"
      className={cn("overflow-hidden rounded-md border", className)}
      {...props}
    />
  )
}

/** The header row. Put `DataTableHead` cells inside, one per column, in display order. */
function DataTableHeader({ className, children, ...props }: DataTableHeaderProps) {
  return (
    <Table.Header data-slot="data-table-header" className={className} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Table.Row>{children}</Table.Row>
        </>
      )}
    </Table.Header>
  )
}

/** A body row bound to a row instance; carries the selected state. */
function DataTableRow<TData>({ row, className, ...props }: DataTableRowProps<TData>) {
  return (
    <Table.Row
      data-slot="data-table-row"
      data-state={row.getIsSelected() ? "selected" : undefined}
      className={cn("group/row", className)}
      {...props}
    />
  )
}

/** A body cell bound to a column id; hidden columns render nothing. */
function DataTableCell<TData>({ column: columnId, table: tableProp, className, ...props }: DataTableCellProps<TData>) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  if (column && !column.getIsVisible()) return null
  return <Table.Cell data-slot="data-table-cell" data-column={columnId} className={className} {...props} />
}

/**
 * Renders the current page of rows. `children` receives each row and returns
 * its cells (wrap them in `DataTableRow`, or return a fragment of cells to get
 * a default row). Shows `empty` when there are no rows.
 */
function DataTableBody<TData>({
  table: tableProp,
  empty = "No results.",
  children,
  ...props
}: DataTableBodyProps<TData>) {
  const table = useDataTableContext(tableProp)
  const rows = table.getRowModel().rows
  return (
    <Table.Body data-slot="data-table-body" {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {rows.length ? (
            rows.map((row) => {
              const content = typeof children === "function" ? children(row) : children
              return React.isValidElement(content) && content.type === DataTableRow ? (
                <React.Fragment key={row.id}>{content}</React.Fragment>
              ) : (
                <DataTableRow key={row.id} row={row}>
                  {content}
                </DataTableRow>
              )
            })
          ) : (
            <DataTableEmpty table={table}>{empty}</DataTableEmpty>
          )}
        </>
      )}
    </Table.Body>
  )
}

/** A single full-width row for the empty state; spans the visible columns. */
function DataTableEmpty<TData>({ table: tableProp, colSpan, className, ...props }: DataTableEmptyProps<TData>) {
  const table = useDataTableContext(tableProp)
  const span = colSpan ?? Math.max(1, table.getAllColumns().filter((c) => c.getIsVisible()).length)
  return (
    <Table.Row data-slot="data-table-empty">
      <Table.Cell colSpan={span} className={cn("h-24 text-center", className)} {...props} />
    </Table.Row>
  )
}

/** The scrolling, bordered table. Compose `DataTableHeader` and `DataTableBody` inside. */
function DataTableTable({ className, ...props }: DataTableTableProps) {
  return (
    <DataTableContainer>
      <Table.Root data-slot="data-table-table" className={cn("min-w-xl", className)} {...props} />
    </DataTableContainer>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                */
/* -------------------------------------------------------------------------- */

function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5
  const range: Array<number | "..."> = []
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) range.push(i)
  } else {
    range.push(1)
    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) range.push(i)
      range.push("...", totalPages)
    } else if (currentPage >= totalPages - 2) {
      range.push("...")
      for (let i = totalPages - 3; i <= totalPages; i++) range.push(i)
    } else {
      range.push("...")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i)
      range.push("...", totalPages)
    }
  }
  return range
}

function DataTablePagination({ className, ...props }: DataTablePaginationProps) {
  return (
    <ark.div
      data-slot="data-table-pagination"
      className={cn("flex flex-col-reverse items-center justify-between gap-4 px-2 md:flex-row", className)}
      {...props}
    />
  )
}

const defaultPageSizes = [10, 20, 30, 40, 50]

function DataTablePageSize<TData>({
  table: tableProp,
  pageSizes = defaultPageSizes,
  className,
  children,
}: DataTablePageSizeProps<TData>) {
  const table = useDataTableContext(tableProp)
  const collection = React.useMemo(() => createListCollection({ items: pageSizes.map(String) }), [pageSizes])
  const pageSize = table.getState().pagination.pageSize
  return (
    <div data-slot="data-table-page-size" className={cn("flex items-center gap-2", className)}>
      <Select.Root
        collection={collection}
        value={[String(pageSize)]}
        onValueChange={({ value }) => table.setPageSize(Number(value[0]))}
        positioning={{ placement: "top", sameWidth: true }}
      >
        <Select.Control>
          <Select.Trigger className="h-8 w-17.5">
            <Select.ValueText placeholder={String(pageSize)} />
          </Select.Trigger>
        </Select.Control>
        <Select.Content className="min-w-0">
          {collection.items.map((size) => (
            <Select.Item key={size} item={size}>
              {size}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <p className="hidden text-sm font-medium sm:block">{children ?? "Rows per page"}</p>
    </div>
  )
}

function DataTablePageInfo<TData>({ table: tableProp, className, ...props }: DataTablePageInfoProps<TData>) {
  const table = useDataTableContext(tableProp)
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = Math.max(table.getPageCount(), 1)
  return (
    <ark.div
      data-slot="data-table-page-info"
      className={cn("flex w-25 items-center justify-center text-sm font-medium", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          Page {currentPage} of {totalPages}
        </>
      )}
    </ark.div>
  )
}

function DataTablePageNav<TData>({
  table: tableProp,
  className,
  showEdges = true,
  ...props
}: DataTablePageNavProps<TData>) {
  const table = useDataTableContext(tableProp)
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)
  return (
    <ark.div data-slot="data-table-page-nav" className={cn("flex items-center gap-2", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {showEdges && (
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 md:inline-flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          {pageNumbers.map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                className="h-8 min-w-8 px-2"
                onClick={() => table.setPageIndex(pageNumber - 1)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                <span className="sr-only">Go to page </span>
                {pageNumber}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          {showEdges && (
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 md:inline-flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          )}
        </>
      )}
    </ark.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Bulk actions                                                              */
/* -------------------------------------------------------------------------- */

function DataTableBulkActions<TData>({
  table: tableProp,
  entityName = "row",
  className,
  children,
  ...props
}: DataTableBulkActionsProps<TData>) {
  const table = useDataTableContext(tableProp)
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const { message: announcement, announce } = useLiveRegion({ clearAfter: 3000 })
  const plural = selectedCount > 1 ? "s" : ""

  React.useEffect(() => {
    if (selectedCount === 0) return
    announce(`${selectedCount} ${entityName}${plural} selected. Bulk actions toolbar is available.`)
  }, [selectedCount, entityName, plural, announce])

  return (
    <>
      <LiveRegion.Root data-slot="data-table-live-region" message={announcement} />
      <FloatingToolbar.Root
        open={selectedCount > 0}
        data-slot="data-table-bulk-actions"
        aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${plural}`}
        onEscape={() => table.resetRowSelection()}
        className={className}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <DataTableBulkActionsClear table={table} />
            <Separator.Root orientation="vertical" className="h-5" aria-hidden />
            <DataTableBulkActionsCount table={table} entityName={entityName} />
            <Separator.Root orientation="vertical" className="h-5" aria-hidden />
            {children}
          </>
        )}
      </FloatingToolbar.Root>
    </>
  )
}

function DataTableBulkActionsClear<TData>({
  table: tableProp,
  className,
  asChild,
  children,
  ...props
}: DataTableBulkActionsClearProps<TData>) {
  const table = useDataTableContext(tableProp)
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          data-slot="data-table-bulk-actions-clear"
          variant="outline"
          size="icon"
          asChild={asChild}
          onClick={() => table.resetRowSelection()}
          className={cn("size-6 rounded-full", className)}
          aria-label="Clear selection"
          {...props}
        >
          {asChild ? children : (children ?? <XIcon />)}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Clear selection (Escape)</Tooltip.Content>
    </Tooltip.Root>
  )
}

function DataTableBulkActionsCount<TData>({
  table: tableProp,
  entityName = "row",
  className,
  ...props
}: DataTableBulkActionsCountProps<TData>) {
  const table = useDataTableContext(tableProp)
  const count = table.getFilteredSelectedRowModel().rows.length
  return (
    <ark.div
      data-slot="data-table-bulk-actions-count"
      className={cn("flex items-center gap-1 text-sm", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Badge.Root className="min-w-8 justify-center rounded-lg" aria-label={`${count} selected`}>
            {count}
          </Badge.Root>{" "}
          <span className="hidden sm:inline">
            {entityName}
            {count > 1 ? "s" : ""}
          </span>{" "}
          selected
        </>
      )}
    </ark.div>
  )
}

function DataTableBulkActionTrigger({
  label,
  className,
  children,
  asChild,
  ...props
}: DataTableBulkActionTriggerProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          data-slot="data-table-bulk-action-trigger"
          variant="outline"
          size="icon"
          asChild={asChild}
          className={cn("size-8", className)}
          aria-label={label}
          {...props}
        >
          {asChild ? (
            children
          ) : (
            <>
              {children}
              <span className="sr-only">{label}</span>
            </>
          )}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  )
}

type DataTableRootProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  table: DataTableInstance<TData>
}

type DataTableBodyProps<TData = unknown> = Omit<React.ComponentProps<typeof Table.Body>, "children"> & {
  table?: DataTableInstance<TData>
  /** Content shown when there are no rows. */
  empty?: React.ReactNode
  children: ((row: DataTableRowInstance<TData>) => React.ReactNode) | React.ReactElement
}

type DataTableBulkActionTriggerProps = React.ComponentProps<typeof Button> & { label: string }

type DataTableBulkActionsProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  table?: DataTableInstance<TData>
  /** Noun used in the selection announcement, e.g. `task`. */
  entityName?: string
}

type DataTableBulkActionsClearProps<TData = unknown> = React.ComponentProps<typeof Button> & {
  table?: DataTableInstance<TData>
}

type DataTableBulkActionsCountProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  table?: DataTableInstance<TData>
  /** Noun used in the selection announcement, e.g. `task`. */
  entityName?: string
}

type DataTableCellProps<TData = unknown> = React.ComponentProps<typeof Table.Cell> & {
  column?: string
  table?: DataTableInstance<TData>
}

type DataTableHeadProps<TData = unknown> = React.ComponentProps<typeof Table.Head> & {
  column?: string
  table?: DataTableInstance<TData>
}

type DataTableContainerProps = React.ComponentProps<typeof ark.div>

type DataTableEmptyProps<TData = unknown> = React.ComponentProps<typeof Table.Cell> & {
  table?: DataTableInstance<TData>
  colSpan?: number
}

type DataTableFacetedFilterProps<TData = unknown, TValue = unknown> = {
  table?: DataTableInstance<TData>
  /** Id of the column this filter applies to. */
  columnId?: string
  column?: DataTableColumn<TData, TValue>
  title?: string
  /** Facet options as `{ value, label, icon? }`. */
  options: FacetOption[]
}

type DataTableHeaderProps = React.ComponentProps<typeof Table.Header>

type DataTablePageInfoProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  table?: DataTableInstance<TData>
}

type DataTablePageNavProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  table?: DataTableInstance<TData>
  /** Show the first and last page buttons. */
  showEdges?: boolean
}

type DataTablePageSizeProps<TData = unknown> = {
  table?: DataTableInstance<TData>
  /** Choices offered in the page size select. */
  pageSizes?: number[]
  className?: string
  children?: React.ReactNode
}

type DataTablePaginationProps = React.ComponentProps<typeof ark.div>

type DataTableResetFiltersProps<TData = unknown> = React.ComponentProps<typeof Button> & {
  table?: DataTableInstance<TData>
}

type DataTableRowProps<TData = unknown> = React.ComponentProps<typeof Table.Row> & {
  row: DataTableRowInstance<TData>
}

type DataTableRowActionsProps = React.ComponentProps<typeof DropdownMenu.Root> & {
  className?: string
  /** Replace the default ellipsis button with your own element. */
  trigger?: React.ReactElement
}

type DataTableSearchProps<TData = unknown> = Omit<React.ComponentProps<typeof Input.Root>, "value" | "onChange"> & {
  table?: DataTableInstance<TData>
  /** Filter a single column instead of the global filter. */
  columnId?: string
}

type DataTableSelectAllProps<TData = unknown> = Omit<
  React.ComponentProps<typeof Checkbox.Root>,
  "checked" | "onCheckedChange"
> & {
  table: DataTableInstance<TData>
}

type DataTableSelectRowProps<TData = unknown> = Omit<
  React.ComponentProps<typeof Checkbox.Root>,
  "checked" | "onCheckedChange"
> & {
  row: DataTableRowInstance<TData>
}

type DataTableTableProps = React.ComponentProps<typeof Table.Root>

type DataTableToolbarProps = React.ComponentProps<typeof ark.div>

type DataTableToolbarGroupProps = React.ComponentProps<typeof ark.div>

type DataTableViewOptionsProps<TData = unknown> = {
  table?: DataTableInstance<TData>
  className?: string
  children?: React.ReactNode
}

const DataTable = {
  Root: DataTableRoot,
  Body: DataTableBody,
  BulkActionTrigger: DataTableBulkActionTrigger,
  BulkActions: DataTableBulkActions,
  BulkActionsClear: DataTableBulkActionsClear,
  BulkActionsCount: DataTableBulkActionsCount,
  Cell: DataTableCell,
  Head: DataTableHead,
  Container: DataTableContainer,
  Empty: DataTableEmpty,
  FacetedFilter: DataTableFacetedFilter,
  Header: DataTableHeader,
  PageInfo: DataTablePageInfo,
  PageNav: DataTablePageNav,
  PageSize: DataTablePageSize,
  Pagination: DataTablePagination,
  ResetFilters: DataTableResetFilters,
  Row: DataTableRow,
  RowActions: DataTableRowActions,
  Search: DataTableSearch,
  SelectAll: DataTableSelectAll,
  SelectRow: DataTableSelectRow,
  Table: DataTableTable,
  Toolbar: DataTableToolbar,
  ToolbarGroup: DataTableToolbarGroup,
  ViewOptions: DataTableViewOptions,
}

export {
  DataTable,
  getPageNumbers,
  useDataTable,
  useDataTableContext,
  type ColumnDef,
  type ColumnFiltersState,
  type FacetOption,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type DataTableColumn,
  type DataTableInstance,
  type DataTableRowInstance,
  type TableOptions,
  type VisibilityState,
  type DataTableRootProps,
  type DataTableBodyProps,
  type DataTableBulkActionTriggerProps,
  type DataTableBulkActionsProps,
  type DataTableBulkActionsClearProps,
  type DataTableBulkActionsCountProps,
  type DataTableCellProps,
  type DataTableHeadProps,
  type DataTableContainerProps,
  type DataTableEmptyProps,
  type DataTableFacetedFilterProps,
  type DataTableHeaderProps,
  type DataTablePageInfoProps,
  type DataTablePageNavProps,
  type DataTablePageSizeProps,
  type DataTablePaginationProps,
  type DataTableResetFiltersProps,
  type DataTableRowProps,
  type DataTableRowActionsProps,
  type DataTableSearchProps,
  type DataTableSelectAllProps,
  type DataTableSelectRowProps,
  type DataTableTableProps,
  type DataTableToolbarProps,
  type DataTableToolbarGroupProps,
  type DataTableViewOptionsProps,
}
