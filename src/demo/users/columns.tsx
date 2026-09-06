import { type ColumnDef } from "@/components/ui/data-table"
import type { User } from "./data"

const includesFilter = (row: { getValue: (id: string) => unknown }, id: string, value: unknown) =>
  Array.isArray(value) ? value.includes(row.getValue(id)) : true

/** Column config is data only. Cells and headers are composed in `users-table.tsx`. */
export const userColumns: ColumnDef<User>[] = [
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "username", label: "Username", enableHiding: false },
  { id: "fullName", label: "Name", accessorFn: (row) => `${row.firstName} ${row.lastName}` },
  { accessorKey: "email", label: "Email" },
  { accessorKey: "phoneNumber", label: "Phone Number", enableSorting: false },
  { accessorKey: "status", label: "Status", filterFn: includesFilter, enableHiding: false, enableSorting: false },
  { accessorKey: "role", label: "Role", filterFn: includesFilter, enableHiding: false, enableSorting: false },
  { id: "actions", enableSorting: false, enableHiding: false },
]
