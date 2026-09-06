import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTablePageInfo,
  DataTablePageNav,
  DataTablePagination,
  DataTableResetFilters,
  DataTableSearch,
  DataTableTable,
  DataTableToolbar,
  DataTableToolbarGroup,
  DataTableViewOptions,
  useDataTable,
} from "@/components/ui/data-table"
import type { ColumnDef } from "@/lib/table"

type Task = { id: string; title: string; status: "todo" | "doing" | "done"; priority: "low" | "medium" | "high" }

const tasks: Task[] = Array.from({ length: 23 }, (_, i) => ({
  id: `TASK-${1000 + i}`,
  title: ["Write docs", "Fix the build", "Ship the CLI", "Review PR", "Plan sprint"][i % 5] + ` #${i + 1}`,
  status: (["todo", "doing", "done"] as const)[i % 3],
  priority: (["low", "medium", "high"] as const)[(i * 7) % 3],
}))

// Column config is data only: no render functions, no markup.
const columns: ColumnDef<Task>[] = [
  { accessorKey: "id", label: "Task", enableSorting: false, enableHiding: false },
  { accessorKey: "title", label: "Title" },
  { accessorKey: "status", label: "Status" },
  { accessorKey: "priority", label: "Priority" },
]

export default function DataTableExample() {
  const table = useDataTable({ data: tasks, columns, initialState: { pagination: { pageIndex: 0, pageSize: 5 } } })
  return (
    <DataTable table={table} className="w-full">
      <DataTableToolbar>
        <DataTableToolbarGroup>
          <DataTableSearch placeholder="Filter tasks…" />
          <DataTableResetFilters />
        </DataTableToolbarGroup>
        <DataTableViewOptions />
      </DataTableToolbar>
      <DataTableTable>
        <DataTableHeader>
          <DataTableHead column="id">Task</DataTableHead>
          <DataTableHead column="title">Title</DataTableHead>
          <DataTableHead column="status">Status</DataTableHead>
          <DataTableHead column="priority">Priority</DataTableHead>
        </DataTableHeader>
        <DataTableBody table={table}>
          {(row) => (
            <>
              <DataTableCell column="id" className="w-28 font-mono text-xs">
                {row.original.id}
              </DataTableCell>
              <DataTableCell column="title">{row.original.title}</DataTableCell>
              <DataTableCell column="status">
                <Badge variant="outline" className="capitalize">
                  {row.original.status}
                </Badge>
              </DataTableCell>
              <DataTableCell column="priority" className="capitalize">
                {row.original.priority}
              </DataTableCell>
            </>
          )}
        </DataTableBody>
      </DataTableTable>
      <DataTablePagination>
        <DataTablePageInfo />
        <DataTablePageNav />
      </DataTablePagination>
    </DataTable>
  )
}
