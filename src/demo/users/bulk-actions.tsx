import * as React from "react"
import { MailIcon, Trash2Icon, UserCheckIcon, UserXIcon } from "lucide-react"
import { toast } from "sonner"
import { DataTableBulkActionTrigger, DataTableBulkActions, type DataTableInstance } from "@/components/ui/data-table"
import type { User } from "./data"
import { UsersMultiDeleteDialog } from "./dialogs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function UserBulkActions({ table }: { table: DataTableInstance<User> }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const count = table.getFilteredSelectedRowModel().rows.length
  const noun = `user${count > 1 ? "s" : ""}`

  const run = (loading: string, success: string, error: string) => {
    toast.promise(sleep(2000), { loading, success, error })
    table.resetRowSelection()
  }

  return (
    <>
      <DataTableBulkActions table={table} entityName="user">
        <DataTableBulkActionTrigger
          label="Invite selected users"
          onClick={() => run("Inviting users...", `Invited ${count} ${noun}`, "Error inviting users")}
        >
          <MailIcon />
        </DataTableBulkActionTrigger>
        <DataTableBulkActionTrigger
          label="Activate selected users"
          onClick={() => run("Activating users...", `Activated ${count} ${noun}`, "Error activating users")}
        >
          <UserCheckIcon />
        </DataTableBulkActionTrigger>
        <DataTableBulkActionTrigger
          label="Deactivate selected users"
          onClick={() => run("Deactivating users...", `Deactivated ${count} ${noun}`, "Error deactivating users")}
        >
          <UserXIcon />
        </DataTableBulkActionTrigger>
        <DataTableBulkActionTrigger
          label="Delete selected users"
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2Icon />
        </DataTableBulkActionTrigger>
      </DataTableBulkActions>

      <UsersMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
    </>
  )
}
