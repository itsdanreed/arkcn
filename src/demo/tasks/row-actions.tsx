import { Trash2Icon } from "lucide-react"
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableRowActions, type DataTableRowInstance } from "@/components/ui/data-table"
import { labels, type Task } from "./data"
import { useTasks } from "./tasks-provider"

export function TaskRowActions({ row }: { row: DataTableRowInstance<Task> }) {
  const task = row.original
  const { setOpen, setCurrentRow } = useTasks()
  return (
    <DataTableRowActions>
      <DropdownMenuItem
        value="edit"
        onSelect={() => {
          setCurrentRow(task)
          setOpen("update")
        }}
      >
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem value="copy" disabled>
        Make a copy
      </DropdownMenuItem>
      <DropdownMenuItem value="favorite" disabled>
        Favorite
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={task.label}>
            {labels.map((label) => (
              <DropdownMenuRadioItem key={label.value} value={label.value}>
                {label.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        value="delete"
        onSelect={() => {
          setCurrentRow(task)
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
