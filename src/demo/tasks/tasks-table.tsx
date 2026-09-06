import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableFacetedFilter,
  DataTableHead,
  DataTableHeader,
  DataTablePageInfo,
  DataTablePageNav,
  DataTablePageSize,
  DataTablePagination,
  DataTableResetFilters,
  DataTableSearch,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableTable,
  DataTableToolbar,
  DataTableToolbarGroup,
  DataTableViewOptions,
  useDataTable,
} from "@/components/ui/data-table"
import { TaskBulkActions } from "./bulk-actions"
import { taskColumns } from "./columns"
import { labels, priorities, statuses, type Task } from "./data"
import { TaskRowActions } from "./row-actions"

export function TasksTable({ data }: { data: Task[] }) {
  const table = useDataTable({
    data,
    columns: taskColumns,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase()
      return (
        String(row.getValue("id")).toLowerCase().includes(search) ||
        String(row.getValue("title")).toLowerCase().includes(search)
      )
    },
  })

  return (
    <DataTable table={table} className="max-sm:has-[[role=toolbar]]:mb-16">
      <DataTableToolbar>
        <DataTableToolbarGroup>
          <DataTableSearch placeholder="Filter by title or ID..." />
          <div className="flex gap-2">
            <DataTableFacetedFilter columnId="status" title="Status" options={statuses} />
            <DataTableFacetedFilter columnId="priority" title="Priority" options={priorities} />
          </div>
          <DataTableResetFilters />
        </DataTableToolbarGroup>
        <DataTableViewOptions />
      </DataTableToolbar>

      <DataTableTable>
        <DataTableHeader>
          <DataTableHead column="select">
            <DataTableSelectAll table={table} />
          </DataTableHead>
          <DataTableHead column="id">Task</DataTableHead>
          <DataTableHead column="title" className="w-2/3">
            Title
          </DataTableHead>
          <DataTableHead column="status">Status</DataTableHead>
          <DataTableHead column="priority">Priority</DataTableHead>
          <DataTableHead column="actions" />
        </DataTableHeader>
        <DataTableBody table={table}>
          {(row) => {
            const task = row.original
            const label = labels.find((l) => l.value === task.label)
            const status = statuses.find((s) => s.value === task.status)
            const priority = priorities.find((p) => p.value === task.priority)
            return (
              <>
                <DataTableCell column="select">
                  <DataTableSelectRow row={row} />
                </DataTableCell>
                <DataTableCell column="id" className="w-20">
                  {task.id}
                </DataTableCell>
                <DataTableCell column="title" className="max-w-0">
                  <div className="flex gap-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="truncate font-medium">{task.title}</span>
                  </div>
                </DataTableCell>
                <DataTableCell column="status">
                  {status && (
                    <div className="flex w-25 items-center gap-2">
                      <status.icon className="size-4 text-muted-foreground" />
                      <span>{status.label}</span>
                    </div>
                  )}
                </DataTableCell>
                <DataTableCell column="priority">
                  {priority && (
                    <div className="flex items-center gap-2">
                      <priority.icon className="size-4 text-muted-foreground" />
                      <span>{priority.label}</span>
                    </div>
                  )}
                </DataTableCell>
                <DataTableCell column="actions">
                  <TaskRowActions row={row} />
                </DataTableCell>
              </>
            )
          }}
        </DataTableBody>
      </DataTableTable>

      <DataTablePagination className="mt-auto">
        <div className="flex w-full items-center justify-between">
          <DataTablePageInfo className="md:hidden" />
          <DataTablePageSize />
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <DataTablePageInfo className="hidden md:flex" />
          <DataTablePageNav />
        </div>
      </DataTablePagination>
      <TaskBulkActions table={table} />
    </DataTable>
  )
}
