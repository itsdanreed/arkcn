"use client"

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useFilter,
  useListCollection,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"
import { FloatingToolbar } from "@/components/ui/floating-toolbar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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

function DataTable<TData>({
  table,
  className,
  ...props
}: React.ComponentProps<"div"> & { table: DataTableInstance<TData> }) {
  return (
    <DataTableContext.Provider value={table}>
      <div data-slot="data-table" className={cn("flex flex-1 flex-col gap-4", className)} {...props} />
    </DataTableContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                   */
/* -------------------------------------------------------------------------- */

function DataTableToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function DataTableToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-toolbar-group"
      className={cn("flex flex-1 flex-col-reverse items-start gap-2 sm:flex-row sm:items-center", className)}
      {...props}
    />
  )
}

function DataTableSearch<TData>({
  table: tableProp,
  columnId,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  table?: DataTableInstance<TData>
  /** Filter a single column instead of the global filter. */
  columnId?: string
}) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  const value = columnId
    ? ((column?.getFilterValue() as string) ?? "")
    : ((table.getState().globalFilter as string) ?? "")
  return (
    <Input
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
}: React.ComponentProps<typeof Button> & { table?: DataTableInstance<TData> }) {
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
}: {
  table?: DataTableInstance<TData>
  /** Id of the column this filter applies to. */
  columnId?: string
  column?: DataTableColumn<TData, TValue>
  title?: string
  /** Facet options as `{ value, label, icon? }`. */
  options: FacetOption[]
}) {
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
    <Popover positioning={{ placement: "bottom-start" }}>
      <PopoverTrigger asChild>
        <Button data-slot="data-table-faceted-filter-trigger" variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent data-slot="data-table-faceted-filter-content" className="w-50 p-0">
        <Command collection={collection} value={[]} onSelect={({ value }) => toggle(value)}>
          <CommandInput placeholder={title} onValueChange={filter} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {collection.items.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
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
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    item={{ label: "Clear filters", value: "__clear__" }}
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center **:data-[slot=command-item-indicator]:hidden"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------- */
/*  View options                                                              */
/* -------------------------------------------------------------------------- */

function DataTableViewOptions<TData>({
  table: tableProp,
  className,
  children,
}: {
  table?: DataTableInstance<TData>
  className?: string
  children?: React.ReactNode
}) {
  const table = useDataTableContext(tableProp)
  return (
    <DropdownMenu positioning={{ placement: "bottom-end" }}>
      <DropdownMenuTrigger asChild>
        <Button
          data-slot="data-table-view-options-trigger"
          variant="outline"
          size="sm"
          className={cn("ml-auto hidden h-8 lg:flex", className)}
        >
          <Settings2Icon />
          {children ?? "View"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent data-slot="data-table-view-options-content" className="w-37.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                value={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                closeOnSelect={false}
              >
                {column.label ?? column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
}: React.ComponentProps<typeof TableHead> & { column?: string; table?: DataTableInstance<TData> }) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  if (column && !column.getIsVisible()) return null
  if (!column?.getCanSort()) {
    return (
      <TableHead data-slot="data-table-head" data-column={columnId} className={className} {...props}>
        {children}
      </TableHead>
    )
  }
  const sorted = column.getIsSorted()
  return (
    <TableHead data-slot="data-table-head" data-column={columnId} className={className} {...props}>
      <DropdownMenu positioning={{ placement: "bottom-start" }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-2.5 h-8 data-open:bg-accent">
            <span>{children}</span>
            {sorted === "desc" ? <ArrowDownIcon /> : sorted === "asc" ? <ArrowUpIcon /> : <ChevronsUpDownIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="asc" onSelect={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem value="desc" onSelect={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem value="hide" onSelect={() => column.toggleVisibility(false)}>
                <EyeOffIcon className="text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  )
}

/* -------------------------------------------------------------------------- */
/*  Selection cells                                                           */
/* -------------------------------------------------------------------------- */

function DataTableSelectAll<TData>({
  table,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange"> & {
  table: DataTableInstance<TData>
}) {
  return (
    <Checkbox
      data-slot="data-table-select-all"
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={({ checked }) => table.toggleAllPageRowsSelected(checked === true)}
      aria-label="Select all"
      className={cn("translate-y-0.5", className)}
      {...props}
    />
  )
}

function DataTableSelectRow<TData>({
  row,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange"> & {
  row: DataTableRowInstance<TData>
}) {
  return (
    <Checkbox
      data-slot="data-table-select-row"
      checked={row.getIsSelected()}
      onCheckedChange={({ checked }) => row.toggleSelected(checked === true)}
      aria-label="Select row"
      className={cn("translate-y-0.5", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Row actions                                                               */
/* -------------------------------------------------------------------------- */

function DataTableRowActions({
  children,
  className,
  trigger,
  ...props
}: React.ComponentProps<typeof DropdownMenu> & {
  className?: string
  /** Replace the default ellipsis button with your own element. */
  trigger?: React.ReactElement
}) {
  return (
    <DropdownMenu positioning={{ placement: "bottom-end" }} {...props}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent data-slot="data-table-row-actions-content" className="w-40">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/*  Table rendering                                                           */
/* -------------------------------------------------------------------------- */

function DataTableContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="data-table-container" className={cn("overflow-hidden rounded-md border", className)} {...props} />
  )
}

/** The header row. Put `DataTableHead` cells inside, one per column, in display order. */
function DataTableHeader({ className, children, ...props }: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader data-slot="data-table-header" className={className} {...props}>
      <TableRow>{children}</TableRow>
    </TableHeader>
  )
}

/** A body row bound to a row instance; carries the selected state. */
function DataTableRow<TData>({
  row,
  className,
  ...props
}: React.ComponentProps<typeof TableRow> & { row: DataTableRowInstance<TData> }) {
  return (
    <TableRow
      data-slot="data-table-row"
      data-state={row.getIsSelected() ? "selected" : undefined}
      className={cn("group/row", className)}
      {...props}
    />
  )
}

/** A body cell bound to a column id; hidden columns render nothing. */
function DataTableCell<TData>({
  column: columnId,
  table: tableProp,
  className,
  ...props
}: React.ComponentProps<typeof TableCell> & { column?: string; table?: DataTableInstance<TData> }) {
  const table = useDataTableContext(tableProp)
  const column = columnId ? table.getColumn(columnId) : undefined
  if (column && !column.getIsVisible()) return null
  return <TableCell data-slot="data-table-cell" data-column={columnId} className={className} {...props} />
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
}: Omit<React.ComponentProps<typeof TableBody>, "children"> & {
  table?: DataTableInstance<TData>
  /** Content shown when there are no rows. */
  empty?: React.ReactNode
  children: (row: DataTableRowInstance<TData>) => React.ReactNode
}) {
  const table = useDataTableContext(tableProp)
  const rows = table.getRowModel().rows
  return (
    <TableBody data-slot="data-table-body" {...props}>
      {rows.length ? (
        rows.map((row) => {
          const content = children(row)
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
    </TableBody>
  )
}

/** A single full-width row for the empty state; spans the visible columns. */
function DataTableEmpty<TData>({
  table: tableProp,
  colSpan,
  className,
  ...props
}: React.ComponentProps<typeof TableCell> & { table?: DataTableInstance<TData>; colSpan?: number }) {
  const table = useDataTableContext(tableProp)
  const span = colSpan ?? Math.max(1, table.getAllColumns().filter((c) => c.getIsVisible()).length)
  return (
    <TableRow data-slot="data-table-empty">
      <TableCell colSpan={span} className={cn("h-24 text-center", className)} {...props} />
    </TableRow>
  )
}

/** The scrolling, bordered table. Compose `DataTableHeader` and `DataTableBody` inside. */
function DataTableTable({ className, ...props }: React.ComponentProps<typeof Table>) {
  return (
    <DataTableContainer>
      <Table data-slot="data-table-table" className={cn("min-w-xl", className)} {...props} />
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

function DataTablePagination({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
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
}: {
  table?: DataTableInstance<TData>
  /** Choices offered in the page size select. */
  pageSizes?: number[]
  className?: string
  children?: React.ReactNode
}) {
  const table = useDataTableContext(tableProp)
  const collection = React.useMemo(() => createListCollection({ items: pageSizes.map(String) }), [pageSizes])
  const pageSize = table.getState().pagination.pageSize
  return (
    <div data-slot="data-table-page-size" className={cn("flex items-center gap-2", className)}>
      <Select
        collection={collection}
        value={[String(pageSize)]}
        onValueChange={({ value }) => table.setPageSize(Number(value[0]))}
        positioning={{ placement: "top", sameWidth: true }}
      >
        <SelectControl>
          <SelectTrigger className="h-8 w-17.5">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
        </SelectControl>
        <SelectContent className="min-w-0">
          {collection.items.map((size) => (
            <SelectItem key={size} item={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="hidden text-sm font-medium sm:block">{children ?? "Rows per page"}</p>
    </div>
  )
}

function DataTablePageInfo<TData>({
  table: tableProp,
  className,
  ...props
}: React.ComponentProps<"div"> & { table?: DataTableInstance<TData> }) {
  const table = useDataTableContext(tableProp)
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = Math.max(table.getPageCount(), 1)
  return (
    <div
      data-slot="data-table-page-info"
      className={cn("flex w-25 items-center justify-center text-sm font-medium", className)}
      {...props}
    >
      Page {currentPage} of {totalPages}
    </div>
  )
}

function DataTablePageNav<TData>({
  table: tableProp,
  className,
  showEdges = true,
  ...props
}: React.ComponentProps<"div"> & {
  table?: DataTableInstance<TData>
  /** Show the first and last page buttons. */
  showEdges?: boolean
}) {
  const table = useDataTableContext(tableProp)
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)
  return (
    <div data-slot="data-table-page-nav" className={cn("flex items-center gap-2", className)} {...props}>
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
    </div>
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
}: React.ComponentProps<"div"> & {
  table?: DataTableInstance<TData>
  /** Noun used in the selection announcement, e.g. `task`. */
  entityName?: string
}) {
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
      <LiveRegion data-slot="data-table-live-region" message={announcement} />
      <FloatingToolbar
        open={selectedCount > 0}
        data-slot="data-table-bulk-actions"
        aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${plural}`}
        onEscape={() => table.resetRowSelection()}
        className={className}
        {...props}
      >
        <DataTableBulkActionsClear table={table} />
        <Separator orientation="vertical" className="h-5" aria-hidden />
        <DataTableBulkActionsCount table={table} entityName={entityName} />
        <Separator orientation="vertical" className="h-5" aria-hidden />
        {children}
      </FloatingToolbar>
    </>
  )
}

function DataTableBulkActionsClear<TData>({
  table: tableProp,
  className,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { table?: DataTableInstance<TData> }) {
  const table = useDataTableContext(tableProp)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent>Clear selection (Escape)</TooltipContent>
    </Tooltip>
  )
}

function DataTableBulkActionsCount<TData>({
  table: tableProp,
  entityName = "row",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  table?: DataTableInstance<TData>
  /** Noun used in the selection announcement, e.g. `task`. */
  entityName?: string
}) {
  const table = useDataTableContext(tableProp)
  const count = table.getFilteredSelectedRowModel().rows.length
  return (
    <div
      data-slot="data-table-bulk-actions-count"
      className={cn("flex items-center gap-1 text-sm", className)}
      {...props}
    >
      <Badge className="min-w-8 justify-center rounded-lg" aria-label={`${count} selected`}>
        {count}
      </Badge>{" "}
      <span className="hidden sm:inline">
        {entityName}
        {count > 1 ? "s" : ""}
      </span>{" "}
      selected
    </div>
  )
}

function DataTableBulkActionTrigger({
  label,
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export {
  DataTable,
  DataTableBody,
  DataTableBulkActionTrigger,
  DataTableBulkActions,
  DataTableBulkActionsClear,
  DataTableBulkActionsCount,
  DataTableCell,
  DataTableHead,
  DataTableContainer,
  DataTableEmpty,
  DataTableFacetedFilter,
  DataTableHeader,
  DataTablePageInfo,
  DataTablePageNav,
  DataTablePageSize,
  DataTablePagination,
  DataTableResetFilters,
  DataTableRow,
  DataTableRowActions,
  DataTableSearch,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableTable,
  DataTableToolbar,
  DataTableToolbarGroup,
  DataTableViewOptions,
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
}
