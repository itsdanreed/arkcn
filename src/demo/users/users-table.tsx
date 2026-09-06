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
import { cn } from "@/lib/utils"
import { UserBulkActions } from "./bulk-actions"
import { userColumns } from "./columns"
import { roles, statusStyles, statuses, type User } from "./data"
import { LongText } from "./long-text"
import { UserRowActions } from "./row-actions"

const roleOptions = roles.map((r) => ({ ...r }))
const statusOptions = statuses.map((s) => ({ ...s }))

// The select and username columns stay pinned while the table scrolls sideways on small screens.
// Pinned cells need an opaque background, so they mirror the row's hover/selected colors.
const stickyBackground = cn(
  "bg-background transition-colors",
  "group-hover/row:bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-background))]",
  "group-data-[state=selected]/row:bg-muted"
)
const stickySelect = cn("inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky", stickyBackground)
const stickyUsername = cn(
  "inset-s-6 ps-0.5 max-md:sticky max-md:ps-2.5",
  stickyBackground,
  "drop-shadow-[0_1px_2px_rgb(0_0_0/0.1)] @4xl/content:drop-shadow-none dark:drop-shadow-[0_1px_2px_rgb(255_255_255/0.1)]"
)

export function UsersTable({ data }: { data: User[] }) {
  const table = useDataTable({
    data,
    columns: userColumns,
    globalFilterFn: (row, _columnId, filterValue) =>
      String(row.getValue("username")).toLowerCase().includes(String(filterValue).toLowerCase()),
  })

  return (
    <DataTable table={table} className="max-sm:has-[[role=toolbar]]:mb-16">
      <DataTableToolbar>
        <DataTableToolbarGroup>
          <DataTableSearch placeholder="Filter users..." />
          <div className="flex gap-2">
            <DataTableFacetedFilter columnId="status" title="Status" options={statusOptions} />
            <DataTableFacetedFilter columnId="role" title="Role" options={roleOptions} />
          </div>
          <DataTableResetFilters />
        </DataTableToolbarGroup>
        <DataTableViewOptions />
      </DataTableToolbar>

      <DataTableTable>
        <DataTableHeader>
          <DataTableHead column="select" className={stickySelect}>
            <DataTableSelectAll table={table} />
          </DataTableHead>
          <DataTableHead column="username" className={stickyUsername}>
            Username
          </DataTableHead>
          <DataTableHead column="fullName" className="w-36">
            Name
          </DataTableHead>
          <DataTableHead column="email">Email</DataTableHead>
          <DataTableHead column="phoneNumber">Phone Number</DataTableHead>
          <DataTableHead column="status">Status</DataTableHead>
          <DataTableHead column="role">Role</DataTableHead>
          <DataTableHead column="actions" />
        </DataTableHeader>
        <DataTableBody table={table}>
          {(row) => {
            const user = row.original
            const role = roles.find((r) => r.value === user.role)
            return (
              <>
                <DataTableCell column="select" className={stickySelect}>
                  <DataTableSelectRow row={row} />
                </DataTableCell>
                <DataTableCell column="username" className={stickyUsername}>
                  <LongText className="max-w-36 ps-3">{user.username}</LongText>
                </DataTableCell>
                <DataTableCell column="fullName" className="w-36">
                  <LongText className="max-w-36">{row.getValue<string>("fullName")}</LongText>
                </DataTableCell>
                <DataTableCell column="email">
                  <div className="w-fit ps-2 text-nowrap">{user.email}</div>
                </DataTableCell>
                <DataTableCell column="phoneNumber" className="text-nowrap">
                  {user.phoneNumber}
                </DataTableCell>
                <DataTableCell column="status">
                  <Badge variant="outline" className={cn("capitalize", statusStyles[user.status])}>
                    {user.status}
                  </Badge>
                </DataTableCell>
                <DataTableCell column="role">
                  {role && (
                    <div className="flex items-center gap-x-2">
                      <role.icon className="size-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{role.value}</span>
                    </div>
                  )}
                </DataTableCell>
                <DataTableCell column="actions">
                  <UserRowActions row={row} />
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
      <UserBulkActions table={table} />
    </DataTable>
  )
}
