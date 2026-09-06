import * as React from "react"
import type { Task } from "./data"

type TasksDialog = "create" | "update" | "delete" | "import"

type TasksContextValue = {
  open: TasksDialog | null
  setOpen: (dialog: TasksDialog | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
}

const TasksContext = React.createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<TasksDialog | null>(null)
  const [currentRow, setCurrentRow] = React.useState<Task | null>(null)
  const value = React.useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, currentRow])
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = React.useContext(TasksContext)
  if (!ctx) throw new Error("useTasks must be used within <TasksProvider>")
  return ctx
}
