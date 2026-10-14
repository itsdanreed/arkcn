import { useAuditMotion } from "../audit-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Archive, Trash2 } from "lucide-react"
import { DataTable, useDataTable, reorderRowIds } from "@/components/ui/data-table"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import type { ColumnDef } from "@/lib/table"
const data = [
  "Write docs",
  "Fix build",
  "Ship CLI",
  "Review PR",
  "Plan sprint",
  "Add tests",
  "Fix icons",
  "Release",
].map((title) => ({ title, status: "Todo" }))
type Task = (typeof data)[number]
const columns: ColumnDef<Task>[] = [
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "title", label: "Title" },
  { accessorKey: "status", label: "Status", enableSorting: false, enableHiding: false },
  { id: "actions", enableSorting: false, enableHiding: false },
]
export default function Example() {
  const { trace } = useAuditMotion('[role="menu"]', 250)
  const [advanced, setAdvanced] = useState(true)
  const [sticky, setSticky] = useState(false)
  const [version, setVersion] = useState(0)
  return (
    <div className="w-full space-y-6">
      <output data-audit-motion hidden>
        {trace}
      </output>
      <Button variant="outline" size="sm" onClick={() => setVersion(version + 1)}>
        Reset table
      </Button>
      <Button variant="outline" size="sm" onClick={() => setAdvanced(!advanced)}>
        {advanced ? "Core controls" : "Advanced controls"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setSticky(!sticky)}>
        {sticky ? "Standard table" : "Sticky columns"}
      </Button>
      {sticky ? (
        <StickyTable key={version} />
      ) : advanced ? (
        <AdvancedTable key={version} />
      ) : (
        <TableExample key={version} />
      )}
    </div>
  )
}
function TableExample() {
  const [action, setAction] = useState("No action")
  const table = useDataTable({ data, columns, initialState: { pagination: { pageIndex: 0, pageSize: 4 } } })
  return (
    <>
      <DataTable.Root table={table}>
        <DataTable.Toolbar>
          <div className="flex items-center gap-2">
            <DataTable.Search columnId="title" placeholder="Filter tasks…" />
            <DataTable.ResetFilters />
          </div>
        </DataTable.Toolbar>
        <DataTable.Table>
          <DataTable.Header>
            <DataTable.Head>
              <DataTable.SelectAll table={table} />
            </DataTable.Head>
            <DataTable.Head column="title">Title</DataTable.Head>
            <DataTable.Head column="status">Status</DataTable.Head>
            <DataTable.Head>
              <span className="sr-only">Actions</span>
            </DataTable.Head>
          </DataTable.Header>
          <DataTable.Body table={table} empty="No results.">
            {(row) => (
              <>
                <DataTable.Cell>
                  <DataTable.SelectRow row={row} />
                </DataTable.Cell>
                <DataTable.Cell column="title">{row.original.title}</DataTable.Cell>
                <DataTable.Cell column="status">Todo</DataTable.Cell>
                <DataTable.Cell>
                  <DataTable.RowActions>
                    <DropdownMenu.Item value="edit" onSelect={() => setAction(`Edit ${row.original.title}`)}>
                      Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item value="copy" onSelect={() => setAction(`Copy ${row.original.title}`)}>
                      Make a copy
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      value="delete"
                      variant="destructive"
                      onSelect={() => setAction(`Delete ${row.original.title}`)}
                    >
                      Delete
                    </DropdownMenu.Item>
                  </DataTable.RowActions>
                </DataTable.Cell>
              </>
            )}
          </DataTable.Body>
        </DataTable.Table>
        <DataTable.Pagination>
          <DataTable.PageInfo />
          <DataTable.PageNav showEdges={false} />
        </DataTable.Pagination>
      </DataTable.Root>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {table.getFilteredSelectedRowModel().rows.length} selected. {action}.
      </p>
    </>
  )
}

const advancedRows = [
  { id: "docs", title: "Write docs", status: "Todo" },
  { id: "build", title: "Fix build", status: "Doing" },
  { id: "cli", title: "Ship CLI", status: "Done" },
  { id: "review", title: "Review PR", status: "Todo" },
]
const advancedColumns: ColumnDef<(typeof advancedRows)[number]>[] = [
  { id: "drag", enableSorting: false, enableHiding: false },
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "title", label: "Title", enableSorting: false },
  { accessorKey: "status", label: "Status", enableSorting: false },
]
function AdvancedTable() {
  const [rows, setRows] = useState(advancedRows)
  const [action, setAction] = useState("No action")
  const table = useDataTable({
    data: rows,
    columns: advancedColumns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 4 } },
  })
  const { trace } = useAuditMotion(
    '[data-slot="data-table-faceted-filter-content"], [data-slot="data-table-bulk-actions"]',
    260
  )
  return (
    <DataTable.Root
      table={table}
      onRowReorder={
        table.getState().columnFilters.length
          ? undefined
          : (details) =>
              setRows((items) =>
                reorderRowIds(
                  items.map((item) => item.id),
                  details
                ).map((id) => items.find((item) => item.id === id)!)
              )
      }
    >
      <output data-advanced-motion hidden>
        {trace}
      </output>
      <div className="flex flex-wrap items-center gap-2">
        <DataTable.FacetedFilter
          columnId="status"
          title="Status"
          options={["Todo", "Doing", "Done"].map((value) => ({ label: value, value }))}
        />
        <DataTable.ViewOptions />
      </div>
      <DataTable.Table>
        <DataTable.Header>
          <DataTable.Head>
            <span className="sr-only">Reorder</span>
          </DataTable.Head>
          <DataTable.Head>
            <DataTable.SelectAll table={table} />
          </DataTable.Head>
          <DataTable.Head column="title">Title</DataTable.Head>
          <DataTable.Head column="status">Status</DataTable.Head>
        </DataTable.Header>
        <DataTable.Body table={table} empty="No results.">
          {(row) => (
            <>
              <DataTable.Cell>
                <DataTable.RowHandle label={`Reorder ${row.original.title}`} />
              </DataTable.Cell>
              <DataTable.Cell>
                <DataTable.SelectRow row={row} />
              </DataTable.Cell>
              <DataTable.Cell column="title">{row.original.title}</DataTable.Cell>
              <DataTable.Cell column="status">{row.original.status}</DataTable.Cell>
            </>
          )}
        </DataTable.Body>
      </DataTable.Table>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DataTable.PageSize pageSizes={[2, 4, 8]} />
        <DataTable.PageInfo />
        <DataTable.PageNav showEdges={false} />
      </div>
      <DataTable.BulkActions>
        <DataTable.BulkActionTrigger
          label="Archive selected"
          onClick={() => setAction(`Archive ${table.getFilteredSelectedRowModel().rows.length}`)}
        >
          <Archive />
        </DataTable.BulkActionTrigger>
        <DataTable.BulkActionTrigger label="Delete selected" disabled>
          <Trash2 />
        </DataTable.BulkActionTrigger>
      </DataTable.BulkActions>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {table.getFilteredSelectedRowModel().rows.length} selected. {action}.
      </p>
    </DataTable.Root>
  )
}

// Ark extension: the untouched reference fixture has no sticky-column behavior.
function StickyTable() {
  const [wide, setWide] = useState(false)
  const [pinned, setPinned] = useState(true)
  const table = useDataTable({
    data,
    columns: [
      { id: "select", enableSorting: false },
      { accessorKey: "title", label: "Title" },
      { accessorKey: "status", enableSorting: false },
      { id: "actions", enableSorting: false },
    ],
    initialState: { pagination: { pageIndex: 0, pageSize: 4 } },
  })
  return (
    <DataTable.Root table={table} className="max-w-[600px]">
      <p className="text-sm text-muted-foreground">
        Ark extension: two sticky columns on the left and actions on the right.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setWide(!wide)}>
          Resize selection column
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.getColumn("select")?.toggleVisibility()}>
          Toggle selection column
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPinned(!pinned)}>
          Toggle pinning
        </Button>
      </div>
      <DataTable.Table
        className="min-w-[960px] table-fixed"
        stickyColumns={pinned ? { left: ["select", "title"], right: ["actions"] } : undefined}
      >
        <DataTable.Header>
          <DataTable.Head column="select" style={{ width: wide ? 96 : 48 }}>
            <DataTable.SelectAll table={table} />
          </DataTable.Head>
          <DataTable.Head column="title" className="w-40">
            Title
          </DataTable.Head>
          <DataTable.Head column="status">Status</DataTable.Head>
          <DataTable.Head column="actions" className="w-24">
            Actions
          </DataTable.Head>
        </DataTable.Header>
        <DataTable.Body table={table}>
          {(row) => (
            <>
              <DataTable.Cell column="select">
                <DataTable.SelectRow row={row} />
              </DataTable.Cell>
              <DataTable.Cell column="title">{row.original.title}</DataTable.Cell>
              <DataTable.Cell column="status">
                {row.original.status} — This content scrolls behind the pinned columns.
              </DataTable.Cell>
              <DataTable.Cell column="actions">
                <Button variant="ghost" size="sm" aria-label={`Open ${row.original.title}`}>
                  Open
                </Button>
              </DataTable.Cell>
            </>
          )}
        </DataTable.Body>
      </DataTable.Table>
    </DataTable.Root>
  )
}
