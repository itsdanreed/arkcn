import { Badge } from "@/components/ui/badge"
import { DataTable, useDataTable } from "@/components/ui/data-table"
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
    <DataTable.Root table={table} className="w-full">
      <DataTable.Toolbar>
        <DataTable.ToolbarGroup>
          <DataTable.Search placeholder="Filter tasks…" />
          <DataTable.ResetFilters />
        </DataTable.ToolbarGroup>
        <DataTable.ViewOptions />
      </DataTable.Toolbar>
      <DataTable.Table>
        <DataTable.Header>
          <DataTable.Head column="id">Task</DataTable.Head>
          <DataTable.Head column="title">Title</DataTable.Head>
          <DataTable.Head column="status">Status</DataTable.Head>
          <DataTable.Head column="priority">Priority</DataTable.Head>
        </DataTable.Header>
        <DataTable.Body table={table}>
          {(row) => (
            <>
              <DataTable.Cell column="id" className="w-28 font-mono text-xs">
                {row.original.id}
              </DataTable.Cell>
              <DataTable.Cell column="title">{row.original.title}</DataTable.Cell>
              <DataTable.Cell column="status">
                <Badge.Root variant="outline" className="capitalize">
                  {row.original.status}
                </Badge.Root>
              </DataTable.Cell>
              <DataTable.Cell column="priority" className="capitalize">
                {row.original.priority}
              </DataTable.Cell>
            </>
          )}
        </DataTable.Body>
      </DataTable.Table>
      <DataTable.Pagination>
        <DataTable.PageInfo />
        <DataTable.PageNav />
      </DataTable.Pagination>
    </DataTable.Root>
  )
}
