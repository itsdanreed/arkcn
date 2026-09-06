import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { type DataTableInstance } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { labels, priorities, statuses, type Task } from "./data"
import { useTasks } from "./tasks-provider"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ---------------------------------- Confirm --------------------------------- */

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  destructive?: boolean
  disabled?: boolean
  className?: string
} & ({ form: string; onConfirm?: undefined } | { form?: undefined; onConfirm: () => void })

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  destructive,
  disabled,
  className,
  form,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className="text-start sm:place-items-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <Button
            type={form ? "submit" : "button"}
            form={form}
            onClick={onConfirm}
            variant={destructive ? "destructive" : "default"}
            disabled={disabled}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ------------------------------ Multi delete -------------------------------- */

const CONFIRM_WORD = "DELETE"

export function TasksMultiDeleteDialog({
  open,
  onOpenChange,
  table,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: DataTableInstance<Task>
}) {
  const [value, setValue] = React.useState("")
  const count = table.getFilteredSelectedRowModel().rows.length
  const noun = count > 1 ? "tasks" : "task"

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }
    onOpenChange(false)
    toast.promise(sleep(1500), {
      loading: "Deleting tasks...",
      success: () => {
        setValue("")
        table.resetRowSelection()
        return `Deleted ${count} ${noun}`
      },
      error: "Error",
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form="tasks-multi-delete-form"
      disabled={value.trim() !== CONFIRM_WORD}
      destructive
      confirmText="Delete"
      title={
        <span className="inline-flex items-center gap-1 text-destructive">
          <AlertTriangleIcon className="size-4" /> Delete {count} {noun}
        </span>
      }
      description={
        <form
          id="tasks-multi-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className="space-y-4"
        >
          <p>
            Are you sure you want to delete the selected tasks?
            <br />
            This action cannot be undone.
          </p>
          <Label className="flex flex-col items-start gap-1.5">
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </form>
      }
    />
  )
}

/* ------------------------------- Mutate sheet -------------------------------- */

const statusCollection = createListCollection({
  items: statuses,
  itemToString: (s) => s.label,
  itemToValue: (s) => s.value,
})
const priorityCollection = createListCollection({
  items: priorities,
  itemToString: (p) => p.label,
  itemToValue: (p) => p.value,
})

function TaskMutateSheet({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task | null
}) {
  const isUpdate = !!currentRow
  const [title, setTitle] = React.useState(currentRow?.title ?? "")
  const [status, setStatus] = React.useState<string[]>(currentRow ? [currentRow.status] : [])
  const [label, setLabel] = React.useState<string | null>(currentRow?.label ?? null)
  const [priority, setPriority] = React.useState<string[]>(currentRow ? [currentRow.priority] : [])

  return (
    <Sheet open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Task</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Update the task by providing necessary info." : "Add a new task by providing necessary info."}{" "}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form
          id="tasks-form"
          className="flex flex-1 flex-col gap-5 px-4"
          onSubmit={(e) => {
            e.preventDefault()
            onOpenChange(false)
            toast.success(`Task ${isUpdate ? "updated" : "created"}: ${title || "(untitled)"}`)
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select collection={statusCollection} value={status} onValueChange={({ value }) => setStatus(value)}>
              <SelectControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </SelectControl>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} item={s}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Label</Label>
            <RadioGroup value={label} onValueChange={({ value }) => setLabel(value)}>
              {labels.map((l) => (
                <RadioGroupItem key={l.value} value={l.value}>
                  {l.label}
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>
          <div className="grid gap-1.5">
            <Label>Priority</Label>
            <Select collection={priorityCollection} value={priority} onValueChange={({ value }) => setPriority(value)}>
              <SelectControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </SelectControl>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} item={p}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <SheetFooter className="flex-row justify-end gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="tasks-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------ Dialog switch -------------------------------- */

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()
  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 300)
  }
  return (
    <>
      <TaskMutateSheet
        key="task-create"
        open={open === "create"}
        onOpenChange={(o) => (o ? setOpen("create") : close())}
      />
      {currentRow && (
        <>
          <TaskMutateSheet
            key={`task-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={(o) => (o ? setOpen("update") : close())}
            currentRow={currentRow}
          />
          <ConfirmDialog
            key="task-delete"
            destructive
            open={open === "delete"}
            onOpenChange={(o) => (o ? setOpen("delete") : close())}
            onConfirm={() => {
              close()
              toast.success(`Deleted ${currentRow.id}`)
            }}
            className="sm:max-w-md"
            title={`Delete this task: ${currentRow.id}?`}
            description={
              <>
                You are about to delete a task with the ID <strong>{currentRow.id}</strong>.
                <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}
