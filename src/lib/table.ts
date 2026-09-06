import * as React from "react"
import { useControllable } from "@/lib/controllable"

/**
 * A small headless table engine: column definitions, sorting, global and
 * per-column filtering with faceted counts, pagination, row selection, and
 * column visibility. No external dependencies.
 */

/* ------------------------------- Definitions ------------------------------- */

export type SortingState = { id: string; desc: boolean }[]
export type ColumnFiltersState = { id: string; value: unknown }[]
export type PaginationState = { pageIndex: number; pageSize: number }
export type RowSelectionState = Record<string, boolean>
export type VisibilityState = Record<string, boolean>

export type TableState = {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: PaginationState
  rowSelection: RowSelectionState
  columnVisibility: VisibilityState
}

export type Updater<T> = T | ((previous: T) => T)
export type OnChange<T> = (updater: Updater<T>) => void

export type FilterFn<TData> = (row: Row<TData>, columnId: string, filterValue: unknown) => boolean

export type SortingFn<TData> = (a: Row<TData>, b: Row<TData>, columnId: string) => number

export type ColumnDef<TData, TValue = unknown> = {
  /** Required when no `accessorKey` is given. */
  id?: string
  /** Read the value from this property of the row. */
  accessorKey?: keyof TData & string
  /** Compute the value from the row. */
  accessorFn?: (row: TData, index: number) => TValue
  /** Human label (view options, headers); falls back to the column id. */
  label?: string
  enableSorting?: boolean
  enableHiding?: boolean
  enableGlobalFilter?: boolean
  filterFn?: FilterFn<TData>
  sortingFn?: SortingFn<TData>
}

/* ---------------------------------- Runtime -------------------------------- */

export interface Column<TData, TValue = unknown> {
  id: string
  label?: string
  columnDef: ColumnDef<TData, TValue>
  accessorFn?: (row: TData, index: number) => TValue
  getCanSort: () => boolean
  getIsSorted: () => false | "asc" | "desc"
  toggleSorting: (desc?: boolean) => void
  clearSorting: () => void
  getCanHide: () => boolean
  getIsVisible: () => boolean
  toggleVisibility: (visible?: boolean) => void
  getCanFilter: () => boolean
  getFilterValue: () => unknown
  setFilterValue: (value: unknown) => void
  getFacetedUniqueValues: () => Map<unknown, number>
}

export interface Row<TData> {
  id: string
  index: number
  original: TData
  getValue: <TValue = unknown>(columnId: string) => TValue
  getIsSelected: () => boolean
  getCanSelect: () => boolean
  toggleSelected: (selected?: boolean) => void
}

export interface RowModel<TData> {
  rows: Row<TData>[]
}

export interface Table<TData> {
  options: TableOptions<TData>
  getState: () => TableState
  getAllColumns: () => Column<TData>[]
  getVisibleColumns: () => Column<TData>[]
  getColumn: (id: string) => Column<TData> | undefined
  /** All rows before filtering. */
  getCoreRowModel: () => RowModel<TData>
  /** Rows after global and column filters. */
  getFilteredRowModel: () => RowModel<TData>
  /** Filtered and sorted rows. */
  getSortedRowModel: () => RowModel<TData>
  /** The current page of sorted, filtered rows. */
  getRowModel: () => RowModel<TData>
  getFilteredSelectedRowModel: () => RowModel<TData>
  getSelectedRowModel: () => RowModel<TData>
  // sorting
  setSorting: OnChange<SortingState>
  resetSorting: () => void
  // filtering
  setGlobalFilter: (value: string) => void
  setColumnFilters: OnChange<ColumnFiltersState>
  resetColumnFilters: () => void
  // pagination
  setPagination: OnChange<PaginationState>
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  getPageCount: () => number
  getCanPreviousPage: () => boolean
  getCanNextPage: () => boolean
  previousPage: () => void
  nextPage: () => void
  // selection
  setRowSelection: OnChange<RowSelectionState>
  resetRowSelection: () => void
  getIsAllPageRowsSelected: () => boolean
  getIsSomePageRowsSelected: () => boolean
  toggleAllPageRowsSelected: (selected?: boolean) => void
  getIsAllRowsSelected: () => boolean
  toggleAllRowsSelected: (selected?: boolean) => void
  // visibility
  setColumnVisibility: OnChange<VisibilityState>
  resetColumnVisibility: () => void
}

export type TableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
  getRowId?: (row: TData, index: number) => string
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  /** Runs against every row when `globalFilter` is set. Defaults to a case-insensitive `includes` over globally filterable columns. */
  globalFilterFn?: FilterFn<TData>
  /** Uncontrolled initial values. */
  initialState?: Partial<TableState>
  /** Controlled values; pair each with its `on*Change` handler. */
  state?: Partial<TableState>
  onSortingChange?: OnChange<SortingState>
  onColumnFiltersChange?: OnChange<ColumnFiltersState>
  onGlobalFilterChange?: OnChange<string>
  onPaginationChange?: OnChange<PaginationState>
  onRowSelectionChange?: OnChange<RowSelectionState>
  onColumnVisibilityChange?: OnChange<VisibilityState>
  /** Keep the page index inside the page count as filters change. Defaults to true. */
  autoResetPageIndex?: boolean
}

/* ----------------------------------- Helpers -------------------------------- */

function defaultCompare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
}

function defaultColumnFilter<TData>(row: Row<TData>, columnId: string, filterValue: unknown) {
  const value = row.getValue(columnId)
  if (Array.isArray(filterValue)) return filterValue.includes(value)
  if (filterValue == null || filterValue === "") return true
  return String(value ?? "")
    .toLowerCase()
    .includes(String(filterValue).toLowerCase())
}

/* ------------------------------------ Hook ---------------------------------- */

export function useTable<TData>(options: TableOptions<TData>): Table<TData> {
  const {
    data,
    columns: columnDefs,
    getRowId,
    enableRowSelection = true,
    globalFilterFn,
    initialState,
    state: controlled,
    autoResetPageIndex = true,
  } = options

  const [sorting, setSorting] = useControllable(
    controlled?.sorting,
    initialState?.sorting ?? [],
    options.onSortingChange
  )
  const [columnFilters, setColumnFilters] = useControllable(
    controlled?.columnFilters,
    initialState?.columnFilters ?? [],
    options.onColumnFiltersChange
  )
  const [globalFilter, setGlobalFilterState] = useControllable(
    controlled?.globalFilter,
    initialState?.globalFilter ?? "",
    options.onGlobalFilterChange
  )
  const [pagination, setPagination] = useControllable(
    controlled?.pagination,
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
    options.onPaginationChange
  )
  const [rowSelection, setRowSelection] = useControllable(
    controlled?.rowSelection,
    initialState?.rowSelection ?? {},
    options.onRowSelectionChange
  )
  const [columnVisibility, setColumnVisibility] = useControllable(
    controlled?.columnVisibility,
    initialState?.columnVisibility ?? {},
    options.onColumnVisibilityChange
  )

  const state: TableState = React.useMemo(
    () => ({ sorting, columnFilters, globalFilter, pagination, rowSelection, columnVisibility }),
    [sorting, columnFilters, globalFilter, pagination, rowSelection, columnVisibility]
  )

  // Keep a mutable reference so column and row methods always see fresh state
  // without rebuilding every object on each render.
  const tableRef = React.useRef<Table<TData>>(null!)

  /* Columns */
  const columns = React.useMemo<Column<TData>[]>(() => {
    return columnDefs.map((def) => {
      const id = def.id ?? def.accessorKey
      if (!id) throw new Error("Every column needs an `id` or an `accessorKey`.")
      const accessorFn =
        def.accessorFn ??
        (def.accessorKey ? (row: TData) => (row as Record<string, unknown>)[def.accessorKey as string] : undefined)
      const column: Column<TData> = {
        id,
        columnDef: def,

        label: def.label,
        accessorFn: accessorFn as Column<TData>["accessorFn"],
        getCanSort: () => (def.enableSorting ?? true) && !!accessorFn,
        getIsSorted: () => {
          const entry = tableRef.current.getState().sorting.find((s) => s.id === id)
          return entry ? (entry.desc ? "desc" : "asc") : false
        },
        toggleSorting: (desc) => {
          tableRef.current.setSorting((prev) => {
            const current = prev.find((s) => s.id === id)
            const nextDesc = desc ?? (current ? !current.desc : false)
            return [{ id, desc: nextDesc }]
          })
        },
        clearSorting: () => tableRef.current.setSorting((prev) => prev.filter((s) => s.id !== id)),
        getCanHide: () => def.enableHiding ?? true,
        getIsVisible: () => tableRef.current.getState().columnVisibility[id] !== false,
        toggleVisibility: (visible) => {
          tableRef.current.setColumnVisibility((prev) => ({
            ...prev,
            [id]: visible ?? prev[id] === false,
          }))
        },
        getCanFilter: () => !!accessorFn,
        getFilterValue: () => tableRef.current.getState().columnFilters.find((f) => f.id === id)?.value,
        setFilterValue: (value) => {
          tableRef.current.setColumnFilters((prev) => {
            const rest = prev.filter((f) => f.id !== id)
            const isEmpty =
              value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
            return isEmpty ? rest : [...rest, { id, value }]
          })
        },
        getFacetedUniqueValues: () => facetsRef.current.get(id) ?? new Map(),
      }
      return column
    })
  }, [columnDefs])

  const columnById = React.useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  /* Rows */
  const coreRows = React.useMemo<Row<TData>[]>(() => {
    return data.map((original, index) => {
      const id = getRowId ? getRowId(original, index) : String(index)
      const valueCache = new Map<string, unknown>()
      const row: Row<TData> = {
        id,
        index,
        original,
        getValue: <TValue>(columnId: string) => {
          if (valueCache.has(columnId)) return valueCache.get(columnId) as TValue
          const column = columnById.get(columnId)
          const value = column?.accessorFn ? column.accessorFn(original, index) : undefined
          valueCache.set(columnId, value)
          return value as TValue
        },
        getIsSelected: () => !!tableRef.current.getState().rowSelection[id],
        getCanSelect: () => (typeof enableRowSelection === "function" ? enableRowSelection(row) : enableRowSelection),
        toggleSelected: (selected) => {
          if (!row.getCanSelect()) return
          tableRef.current.setRowSelection((prev) => {
            const next = { ...prev }
            const value = selected ?? !prev[id]
            if (value) next[id] = true
            else delete next[id]
            return next
          })
        },
      }
      return row
    })
  }, [data, getRowId, columnById, enableRowSelection])

  /* Filtering */
  const globallyFilteredRows = React.useMemo(() => {
    if (!globalFilter) return coreRows
    const fn: FilterFn<TData> =
      globalFilterFn ??
      ((row, _id, value) => {
        const search = String(value).toLowerCase()
        return columns.some((column) => {
          if (!column.accessorFn || column.columnDef.enableGlobalFilter === false) return false
          return String(row.getValue(column.id) ?? "")
            .toLowerCase()
            .includes(search)
        })
      })
    return coreRows.filter((row) => fn(row, "__global__", globalFilter))
  }, [coreRows, globalFilter, globalFilterFn, columns])

  const filteredRows = React.useMemo(() => {
    let rows = globallyFilteredRows
    for (const filter of columnFilters) {
      const column = columnById.get(filter.id)
      if (!column) continue
      const fn = column.columnDef.filterFn ?? defaultColumnFilter
      rows = rows.filter((row) => fn(row, filter.id, filter.value))
    }
    return rows
  }, [globallyFilteredRows, columnFilters, columnById])

  /* Facets: unique value counts per column, over rows filtered by everything except that column. */
  const facetsRef = React.useRef(new Map<string, Map<unknown, number>>())
  facetsRef.current = React.useMemo(() => {
    const result = new Map<string, Map<unknown, number>>()
    for (const column of columns) {
      if (!column.accessorFn) continue
      let rows = globallyFilteredRows
      for (const filter of columnFilters) {
        if (filter.id === column.id) continue
        const other = columnById.get(filter.id)
        if (!other) continue
        const fn = other.columnDef.filterFn ?? defaultColumnFilter
        rows = rows.filter((row) => fn(row, filter.id, filter.value))
      }
      const counts = new Map<unknown, number>()
      for (const row of rows) {
        const value = row.getValue(column.id)
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }
      result.set(column.id, counts)
    }
    return result
  }, [columns, globallyFilteredRows, columnFilters, columnById])

  /* Sorting */
  const sortedRows = React.useMemo(() => {
    if (sorting.length === 0) return filteredRows
    const rows = [...filteredRows]
    rows.sort((a, b) => {
      for (const { id, desc } of sorting) {
        const column = columnById.get(id)
        if (!column) continue
        const compare = column.columnDef.sortingFn
          ? column.columnDef.sortingFn(a, b, id)
          : defaultCompare(a.getValue(id), b.getValue(id))
        if (compare !== 0) return desc ? -compare : compare
      }
      return a.index - b.index
    })
    return rows
  }, [filteredRows, sorting, columnById])

  /* Pagination */
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pagination.pageSize))
  const pageRows = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return sortedRows.slice(start, start + pagination.pageSize)
  }, [sortedRows, pagination])

  React.useEffect(() => {
    if (!autoResetPageIndex) return
    if (pagination.pageIndex > pageCount - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, pageCount - 1) }))
    }
  }, [autoResetPageIndex, pageCount, pagination.pageIndex, setPagination])

  /* Table */
  const table = React.useMemo<Table<TData>>(() => {
    const t: Table<TData> = {
      options,
      getState: () => state,
      getAllColumns: () => columns,
      getVisibleColumns: () => columns.filter((c) => c.getIsVisible()),
      getColumn: (id) => columnById.get(id),
      getCoreRowModel: () => ({ rows: coreRows }),
      getFilteredRowModel: () => ({ rows: filteredRows }),
      getSortedRowModel: () => ({ rows: sortedRows }),
      getRowModel: () => ({ rows: pageRows }),
      getFilteredSelectedRowModel: () => ({
        rows: filteredRows.filter((r) => r.getIsSelected()),
      }),
      getSelectedRowModel: () => ({ rows: coreRows.filter((r) => r.getIsSelected()) }),
      setSorting,
      resetSorting: () => setSorting([]),
      setGlobalFilter: (value) => {
        setGlobalFilterState(value)
        if (autoResetPageIndex) setPagination((p) => ({ ...p, pageIndex: 0 }))
      },
      setColumnFilters: (updater) => {
        setColumnFilters(updater)
        if (autoResetPageIndex) setPagination((p) => ({ ...p, pageIndex: 0 }))
      },
      resetColumnFilters: () => setColumnFilters([]),
      setPagination,
      setPageIndex: (index) => setPagination((p) => ({ ...p, pageIndex: Math.min(Math.max(0, index), pageCount - 1) })),
      setPageSize: (size) =>
        setPagination((p) => ({ pageSize: size, pageIndex: Math.floor((p.pageIndex * p.pageSize) / size) })),
      getPageCount: () => pageCount,
      getCanPreviousPage: () => pagination.pageIndex > 0,
      getCanNextPage: () => pagination.pageIndex < pageCount - 1,
      previousPage: () => t.setPageIndex(pagination.pageIndex - 1),
      nextPage: () => t.setPageIndex(pagination.pageIndex + 1),
      setRowSelection,
      resetRowSelection: () => setRowSelection({}),
      getIsAllPageRowsSelected: () =>
        pageRows.length > 0 && pageRows.every((r) => !r.getCanSelect() || r.getIsSelected()),
      getIsSomePageRowsSelected: () => pageRows.some((r) => r.getIsSelected()) && !t.getIsAllPageRowsSelected(),
      toggleAllPageRowsSelected: (selected) => {
        const value = selected ?? !t.getIsAllPageRowsSelected()
        setRowSelection((prev) => {
          const next = { ...prev }
          for (const row of pageRows) {
            if (!row.getCanSelect()) continue
            if (value) next[row.id] = true
            else delete next[row.id]
          }
          return next
        })
      },
      getIsAllRowsSelected: () =>
        filteredRows.length > 0 && filteredRows.every((r) => !r.getCanSelect() || r.getIsSelected()),
      toggleAllRowsSelected: (selected) => {
        const value = selected ?? !t.getIsAllRowsSelected()
        setRowSelection(() => {
          const next: RowSelectionState = {}
          if (value) for (const row of filteredRows) if (row.getCanSelect()) next[row.id] = true
          return next
        })
      },
      setColumnVisibility,
      resetColumnVisibility: () => setColumnVisibility({}),
    }
    return t
  }, [
    options,
    state,
    columns,
    columnById,
    coreRows,
    filteredRows,
    sortedRows,
    pageRows,
    pageCount,
    pagination,
    autoResetPageIndex,
    setSorting,
    setGlobalFilterState,
    setColumnFilters,
    setPagination,
    setRowSelection,
    setColumnVisibility,
  ])

  tableRef.current = table
  return table
}
