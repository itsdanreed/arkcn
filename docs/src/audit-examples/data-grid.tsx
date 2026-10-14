import { useAuditMotion } from "../audit-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DataGrid, type DataGridColumnConfig } from "@/components/ui/data-grid"
import { useDataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/lib/table"
const seed = [
  { id: "ava", name: "Ava Chen", target: 24, role: "Admin", active: true },
  { id: "noah", name: "Noah Patel", target: 12, role: "Member", active: false },
  { id: "mia", name: "Mia Torres", target: 36, role: "Viewer", active: true },
]
const columns: ColumnDef<(typeof seed)[number]>[] = [
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "name", label: "Name" },
  { accessorKey: "target", enableSorting: false },
  { accessorKey: "role", enableSorting: false },
  { accessorKey: "active", enableSorting: false },
]
const gridColumns: DataGridColumnConfig[] = [
  { id: "select", width: 40, minWidth: 40, pinned: "left" },
  { id: "name", width: 160, pinned: "left", editable: true },
  { id: "target", width: 100, type: "number", editable: true },
  {
    id: "role",
    width: 140,
    type: "select",
    editable: true,
    options: ["Admin", "Member", "Viewer"].map((value) => ({ value, label: value })),
  },
  { id: "active", width: 80, type: "boolean", editable: true },
]
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="select-content"]')
  const [data, setData] = useState(seed)
  const [action, setAction] = useState("No edit")
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 100 } },
  })
  return (
    <div className="w-full max-w-[522px] space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setData(seed)
            table.resetRowSelection()
            table.setSorting([])
            setAction("No edit")
          }}
        >
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={() => setData([])}>
          Empty
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setData(Array.from({ length: 60 }, (_, i) => ({ ...seed[i % 3], id: `row-${i}`, name: `Person ${i + 1}` })))
          }
        >
          Many rows
        </Button>
      </div>
      <DataGrid.Root
        table={table}
        columns={gridColumns}
        className="h-64 w-full"
        onCellChange={({ row, columnId, value }) => {
          setData((items) => items.map((item) => (item.id === row.id ? { ...item, [columnId]: value } : item)))
          setAction(`${columnId}: ${String(value)}`)
        }}
      >
        <DataGrid.Container aria-label="People">
          <DataGrid.Header>
            <DataGrid.HeaderRow>
              <DataGrid.SelectAll />
              <DataGrid.HeadWithResize column="name">Name</DataGrid.HeadWithResize>
              <DataGrid.Head column="target">Target</DataGrid.Head>
              <DataGrid.Head column="role">Role</DataGrid.Head>
              <DataGrid.Head column="active">Active</DataGrid.Head>
            </DataGrid.HeaderRow>
          </DataGrid.Header>
          <DataGrid.Body>
            {() => (
              <>
                <DataGrid.SelectRow />
                <DataGrid.Cell column="name" />
                <DataGrid.Cell column="target" />
                <DataGrid.Cell column="role" />
                <DataGrid.Cell column="active" />
              </>
            )}
          </DataGrid.Body>
          <DataGrid.Empty>No results.</DataGrid.Empty>
        </DataGrid.Container>
      </DataGrid.Root>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {action}
      </p>
    </div>
  )
}
