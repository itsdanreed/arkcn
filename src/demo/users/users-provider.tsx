import * as React from "react"
import type { User } from "./data"

type UsersDialog = "invite" | "add" | "edit" | "delete"

type UsersContextValue = {
  open: UsersDialog | null
  setOpen: (dialog: UsersDialog | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = React.createContext<UsersContextValue | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<UsersDialog | null>(null)
  const [currentRow, setCurrentRow] = React.useState<User | null>(null)
  const value = React.useMemo(() => ({ open, setOpen, currentRow, setCurrentRow }), [open, currentRow])
  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = React.useContext(UsersContext)
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>")
  return ctx
}
