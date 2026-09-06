import * as React from "react"
import { CheckIcon, RotateCcwIcon, Undo2Icon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridContainer,
  DataGridEmpty,
  DataGridHeader,
  DataGridHeadWithResize,
  DataGridHeaderRow,
  DataGridSelectAll,
  DataGridSelectRow,
  type DataGridCellChange,
  type DataGridColumnConfig,
} from "@/components/ui/data-grid"
import {
  DataTable,
  DataTableFacetedFilter,
  DataTableResetFilters,
  DataTableSearch,
  DataTableToolbar,
  DataTableToolbarGroup,
  DataTableViewOptions,
  useDataTable,
} from "@/components/ui/data-table"
import { FloatingToolbar } from "@/components/ui/floating-toolbar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import {
  generateUsers,
  roles,
  statusStyles,
  statuses,
  type User,
  type UserRole,
  type UserStatus,
} from "@/demo/users/data"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@/lib/table"

/* ------------------------------- columns ------------------------------- */

const includesFilter = (row: { getValue: (id: string) => unknown }, id: string, value: unknown) =>
  Array.isArray(value) ? value.includes(row.getValue(id)) : true

/** Engine columns: data only. */
const engineColumns: ColumnDef<User>[] = [
  { id: "select", enableSorting: false, enableHiding: false },
  { accessorKey: "username", label: "Username", enableHiding: false },
  { accessorKey: "firstName", label: "First name" },
  { accessorKey: "lastName", label: "Last name" },
  { accessorKey: "email", label: "Email" },
  { accessorKey: "status", label: "Status", filterFn: includesFilter },
  { accessorKey: "role", label: "Role", filterFn: includesFilter },
  { accessorKey: "phoneNumber", label: "Phone", enableSorting: false },
  { accessorKey: "createdAt", label: "Created" },
]

/** Grid columns: how each column behaves in the grid, also data only. */
const gridColumns: DataGridColumnConfig[] = [
  { id: "select", width: 40, minWidth: 40, pinned: "left" },
  { id: "username", type: "text", editable: true, width: 170, pinned: "left" },
  { id: "firstName", type: "text", editable: true, width: 130 },
  { id: "lastName", type: "text", editable: true, width: 130 },
  { id: "email", type: "text", editable: true, width: 230 },
  { id: "status", type: "select", editable: true, width: 130, options: statuses.map((s) => ({ ...s })) },
  {
    id: "role",
    type: "select",
    editable: true,
    width: 130,
    options: roles.map((r) => ({ value: r.value, label: r.label })),
  },
  { id: "phoneNumber", type: "text", editable: true, width: 160 },
  {
    id: "createdAt",
    type: "date",
    editable: true,
    width: 140,
    format: (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : ""),
    parse: (input, previous) => (input ? new Date(`${input}T00:00:00`) : previous),
  },
]

const statusOptions = statuses.map((s) => ({ ...s }))
const roleOptions = roles.map((r) => ({ ...r }))

type Change = { id: number; rowId: string; columnId: string; previous: unknown; value: unknown; label: string }

/* --------------------------------- page -------------------------------- */

export function DataGridPage() {
  const [data, setData] = React.useState<User[]>(() => generateUsers(500))
  const [changes, setChanges] = React.useState<Change[]>([])
  const counter = React.useRef(0)

  const table = useDataTable<User>({
    data,
    columns: engineColumns,
    getRowId: (user) => user.id,
    // The grid virtualizes; give it every row instead of a page.
    initialState: { pagination: { pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER } },
    globalFilterFn: (row, _columnId, filterValue) =>
      ["username", "firstName", "lastName", "email"].some((id) =>
        String(row.getValue(id)).toLowerCase().includes(String(filterValue).toLowerCase())
      ),
  })

  const apply = (rowId: string, columnId: string, value: unknown) =>
    setData((prev) => prev.map((u) => (u.id === rowId ? { ...u, [columnId]: value } : u)))

  const onCellChange = ({ row, columnId, value, previous }: DataGridCellChange<User>) => {
    apply(row.id, columnId, value)
    setChanges((prev) => [
      ...prev,
      {
        id: counter.current++,
        rowId: row.id,
        columnId,
        previous,
        value,
        label: `${row.original.username} · ${engineColumns.find((c) => c.accessorKey === columnId)?.label ?? columnId}`,
      },
    ])
  }

  const undo = () => {
    const last = changes[changes.length - 1]
    if (!last) return
    apply(last.rowId, last.columnId, last.previous)
    setChanges((prev) => prev.slice(0, -1))
  }

  const discard = () => {
    for (const change of [...changes].reverse()) apply(change.rowId, change.columnId, change.previous)
    setChanges([])
  }

  const save = () => {
    toast.success(`Saved ${changes.length} change${changes.length === 1 ? "" : "s"}`)
    setChanges([])
  }

  const rows = table.getRowModel().rows.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground">
            Click a cell and type, or press Enter, to edit. Arrow keys move, Shift extends a range, ⌘C and ⌘V copy and
            paste.
          </p>
        </div>
      </div>

      <DataTable table={table} className="min-h-0">
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

        <DataGrid table={table} columns={gridColumns} onCellChange={onCellChange} className="min-h-96">
          <DataGridContainer aria-label="Users">
            <DataGridHeader>
              <DataGridHeaderRow>
                <DataGridSelectAll />
                <DataGridHeadWithResize column="username">Username</DataGridHeadWithResize>
                <DataGridHeadWithResize column="firstName">First name</DataGridHeadWithResize>
                <DataGridHeadWithResize column="lastName">Last name</DataGridHeadWithResize>
                <DataGridHeadWithResize column="email">Email</DataGridHeadWithResize>
                <DataGridHeadWithResize column="status">Status</DataGridHeadWithResize>
                <DataGridHeadWithResize column="role">Role</DataGridHeadWithResize>
                <DataGridHeadWithResize column="phoneNumber">Phone</DataGridHeadWithResize>
                <DataGridHeadWithResize column="createdAt">Created</DataGridHeadWithResize>
              </DataGridHeaderRow>
            </DataGridHeader>
            <DataGridBody<User>>
              {(row) => (
                <>
                  <DataGridSelectRow />
                  <DataGridCell column="username" className="font-medium" />
                  <DataGridCell column="firstName" />
                  <DataGridCell column="lastName" />
                  <DataGridCell column="email" className="text-muted-foreground" />
                  <DataGridCell column="status">
                    <Badge
                      variant="outline"
                      className={cn("capitalize", statusStyles[row.getValue<UserStatus>("status")])}
                    >
                      {row.getValue<string>("status")}
                    </Badge>
                  </DataGridCell>
                  <DataGridCell column="role">
                    <RoleCell role={row.getValue<UserRole>("role")} />
                  </DataGridCell>
                  <DataGridCell column="phoneNumber" className="tabular-nums" />
                  <DataGridCell column="createdAt" className="tabular-nums" />
                </>
              )}
            </DataGridBody>
            <DataGridEmpty>No users match.</DataGridEmpty>
          </DataGridContainer>
        </DataGrid>
      </DataTable>

      <FloatingToolbar open={changes.length > 0} aria-label="Unsaved changes" onEscape={discard}>
        <Badge className="min-w-8 justify-center rounded-lg tabular-nums">{changes.length}</Badge>
        <span className="text-sm">unsaved change{changes.length === 1 ? "" : "s"}</span>
        <Separator orientation="vertical" className="h-5" aria-hidden />
        <Button variant="outline" size="sm" onClick={undo}>
          <Undo2Icon /> Undo
        </Button>
        <Button variant="outline" size="sm" onClick={discard}>
          <RotateCcwIcon /> Discard
        </Button>
        <Button size="sm" onClick={save}>
          <CheckIcon /> Save
        </Button>
      </FloatingToolbar>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">{rows} rows · virtualized</span>
        <span className="ml-auto hidden items-center gap-3 md:flex">
          <KbdGroup>
            <Kbd>↵</Kbd>
            <span>edit / next row</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⇥</Kbd>
            <span>next cell</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌫</Kbd>
            <span>clear</span>
          </KbdGroup>
          <span>Drag a header edge to resize</span>
        </span>
      </div>
    </div>
  )
}

function RoleCell({ role }: { role: UserRole }) {
  const def = roles.find((r) => r.value === role)
  if (!def) return <span className="capitalize">{role}</span>
  return (
    <span className="flex items-center gap-1.5">
      <def.icon className="size-4 text-muted-foreground" />
      <span className="capitalize">{def.value}</span>
    </span>
  )
}
