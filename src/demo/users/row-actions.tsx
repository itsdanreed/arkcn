import { Trash2Icon, UserPenIcon } from "lucide-react"
import { DataTableRowActions, type DataTableRowInstance } from "@/components/ui/data-table"
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import type { User } from "./data"
import { useUsers } from "./users-provider"

export function UserRowActions({ row }: { row: DataTableRowInstance<User> }) {
  const { setOpen, setCurrentRow } = useUsers()
  return (
    <DataTableRowActions className="w-40">
      <DropdownMenuItem
        value="edit"
        onSelect={() => {
          setCurrentRow(row.original)
          setOpen("edit")
        }}
      >
        Edit
        <DropdownMenuShortcut>
          <UserPenIcon className="size-4" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        value="delete"
        variant="destructive"
        onSelect={() => {
          setCurrentRow(row.original)
          setOpen("delete")
        }}
      >
        Delete
        <DropdownMenuShortcut>
          <Trash2Icon className="size-4" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DataTableRowActions>
  )
}
