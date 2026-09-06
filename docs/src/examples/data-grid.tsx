import * as React from "react"
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridContainer,
  DataGridHead,
  DataGridHeader,
  DataGridHeaderRow,
  type DataGridCellChange,
  type DataGridColumnConfig,
} from "@/components/ui/data-grid"
import { useDataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/lib/table"

type Person = { id: string; name: string; email: string; role: "admin" | "member" | "viewer"; active: boolean }

const seed: Person[] = Array.from({ length: 40 }, (_, i) => ({
  id: `p${i}`,
  name: ["Ava Chen", "Noah Patel", "Mia Torres", "Liam Brooks", "Zoe Kim"][i % 5],
  email: `user${i + 1}@example.com`,
  role: (["admin", "member", "viewer"] as const)[i % 3],
  active: i % 4 !== 0,
}))

const engineColumns: ColumnDef<Person>[] = [
  { accessorKey: "name", label: "Name" },
  { accessorKey: "email", label: "Email" },
  { accessorKey: "role", label: "Role" },
  { accessorKey: "active", label: "Active" },
]

// How each column behaves in the grid: editor type, width, options.
const gridColumns: DataGridColumnConfig[] = [
  { id: "name", type: "text", editable: true, width: 160, pinned: "left" },
  { id: "email", type: "text", editable: true, width: 220 },
  {
    id: "role",
    type: "select",
    editable: true,
    width: 120,
    options: [
      { value: "admin", label: "Admin" },
      { value: "member", label: "Member" },
      { value: "viewer", label: "Viewer" },
    ],
  },
  { id: "active", type: "boolean", editable: true, width: 90 },
]

export default function DataGridExample() {
  const [data, setData] = React.useState(seed)
  const table = useDataTable<Person>({
    data,
    columns: engineColumns,
    getRowId: (p) => p.id,
    initialState: { pagination: { pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER } },
  })
  // Edits are intents; the consumer owns the data.
  const onCellChange = ({ row, columnId, value }: DataGridCellChange<Person>) =>
    setData((prev) => prev.map((p) => (p.id === row.id ? { ...p, [columnId]: value } : p)))
  return (
    <DataGrid table={table} columns={gridColumns} onCellChange={onCellChange} className="h-80 w-full">
      <DataGridContainer aria-label="People">
        <DataGridHeader>
          <DataGridHeaderRow>
            <DataGridHead column="name">Name</DataGridHead>
            <DataGridHead column="email">Email</DataGridHead>
            <DataGridHead column="role">Role</DataGridHead>
            <DataGridHead column="active">Active</DataGridHead>
          </DataGridHeaderRow>
        </DataGridHeader>
        <DataGridBody<Person>>
          {() => (
            <>
              <DataGridCell column="name" className="font-medium" />
              <DataGridCell column="email" className="text-muted-foreground" />
              <DataGridCell column="role" className="capitalize" />
              <DataGridCell column="active" />
            </>
          )}
        </DataGridBody>
      </DataGridContainer>
    </DataGrid>
  )
}
