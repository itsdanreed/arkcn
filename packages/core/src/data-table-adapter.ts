/**
 * The contract the data table parts render against. `<DataTable>` accepts any
 * object that satisfies it, so the parts are independent of where the rows,
 * sorting, filtering, and paging come from.
 *
 * The built-in engine in `@/lib/table` satisfies it directly and is the
 * default adapter. To drive the parts from another source (a server-side
 * query, a different table library, a store), implement this interface over
 * that source and pass the result to `<DataTable table={...}>`.
 *
 * Columns are data only: the adapter exposes ids, labels, sorting, visibility,
 * and filtering. Headers and cells are composed in JSX on the page with
 * `DataTableHead` / `DataTableCell`, keyed by column id.
 */

export type DataTableSortDirection = false | "asc" | "desc"

export interface DataTableColumn<TData, TValue = unknown> {
  id: string
  /** Human label for view options and headers; falls back to `id`. */
  label?: string
  /** Present on columns that read a value from the row (used by view options). */
  accessorFn?: ((row: TData, index: number) => TValue) | undefined
  getCanSort: () => boolean
  getIsSorted: () => DataTableSortDirection
  toggleSorting: (desc?: boolean) => void
  getCanHide: () => boolean
  getIsVisible: () => boolean
  toggleVisibility: (visible?: boolean) => void
  getFilterValue: () => unknown
  setFilterValue: (value: unknown) => void
  getFacetedUniqueValues: () => Map<unknown, number>
}

export interface DataTableRow<TData> {
  id: string
  original: TData
  getValue: <TValue = unknown>(columnId: string) => TValue
  getIsSelected: () => boolean
  toggleSelected: (selected?: boolean) => void
}

export interface DataTableInstance<TData> {
  getState: () => {
    globalFilter: string
    columnFilters: { id: string; value: unknown }[]
    pagination: { pageIndex: number; pageSize: number }
  }
  getAllColumns: () => DataTableColumn<TData>[]
  getColumn: (id: string) => DataTableColumn<TData> | undefined
  /** The rows to render (already filtered, sorted, and paginated). */
  getRowModel: () => { rows: DataTableRow<TData>[] }
  getFilteredSelectedRowModel: () => { rows: DataTableRow<TData>[] }
  setGlobalFilter: (value: string) => void
  resetColumnFilters: () => void
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  getPageCount: () => number
  getCanPreviousPage: () => boolean
  getCanNextPage: () => boolean
  previousPage: () => void
  nextPage: () => void
  resetRowSelection: () => void
  getIsAllPageRowsSelected: () => boolean
  getIsSomePageRowsSelected: () => boolean
  toggleAllPageRowsSelected: (selected?: boolean) => void
}
