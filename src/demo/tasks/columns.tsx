import { type ColumnDef } from "@/components/ui/data-table"
import type { Task } from "./data"

/** Column config is data only: ids, accessors, sorting, filtering, labels. Cells live in the table markup. */
export const taskColumns: ColumnDef<Task>[] = [
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "id", label: "Task", enableSorting: false, enableHiding: false },
  { accessorKey: "title", label: "Title" },
  { accessorKey: "status", label: "Status" },
  { accessorKey: "priority", label: "Priority" },
  { id: "actions", enableSorting: false, enableHiding: false },
]
