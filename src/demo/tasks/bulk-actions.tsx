import * as React from "react"
import { ArrowUpDownIcon, CircleArrowUpIcon, DownloadIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { DataTableBulkActionTrigger, DataTableBulkActions, type DataTableInstance } from "@/components/ui/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { priorities, statuses, type Task } from "./data"
import { TasksMultiDeleteDialog } from "./dialogs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function TaskBulkActions({ table }: { table: DataTableInstance<Task> }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const selected = table.getFilteredSelectedRowModel().rows
  const count = selected.length
  const noun = `task${count > 1 ? "s" : ""}`

  const run = (loading: string, success: string) => {
    toast.promise(sleep(1500), { loading, success, error: "Error" })
    table.resetRowSelection()
  }

  return (
    <>
      <DataTableBulkActions table={table} entityName="task">
        <DropdownMenu positioning={{ placement: "top", gutter: 14 }}>
          <DropdownMenuTrigger asChild>
            <DataTableBulkActionTrigger label="Update status">
              <CircleArrowUpIcon />
            </DataTableBulkActionTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                value={status.value}
                onSelect={() => run("Updating status...", `Status updated to "${status.label}" for ${count} ${noun}.`)}
              >
                <status.icon className="size-4 text-muted-foreground" />
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu positioning={{ placement: "top", gutter: 14 }}>
          <DropdownMenuTrigger asChild>
            <DataTableBulkActionTrigger label="Update priority">
              <ArrowUpDownIcon />
            </DataTableBulkActionTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                value={priority.value}
                onSelect={() =>
                  run("Updating priority...", `Priority updated to "${priority.label}" for ${count} ${noun}.`)
                }
              >
                <priority.icon className="size-4 text-muted-foreground" />
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DataTableBulkActionTrigger
          label="Export tasks"
          onClick={() => run("Exporting tasks...", `Exported ${count} ${noun} to CSV.`)}
        >
          <DownloadIcon />
        </DataTableBulkActionTrigger>

        <DataTableBulkActionTrigger
          label="Delete selected tasks"
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2Icon />
        </DataTableBulkActionTrigger>
      </DataTableBulkActions>

      <TasksMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
    </>
  )
}
