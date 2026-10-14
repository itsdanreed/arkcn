import { useAuditMotion } from "../../src/audit-motion"
import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table"
// Raw Nova primitives. The muted sticky header and input editing classes come
// from the pinned dashboard-01 table. Fixed widths/viewport are fixture layout.
// Local edit wiring is a baseline, not an upstream grid/virtualization engine.
const seed = [
  { id: "ava", name: "Ava Chen", target: 24, role: "Admin", active: true },
  { id: "noah", name: "Noah Patel", target: 12, role: "Member", active: false },
  { id: "mia", name: "Mia Torres", target: 36, role: "Viewer", active: true },
]
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="select-content"]')
  const [data, setData] = useState(seed)
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<"asc" | "desc" | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [action, setAction] = useState("No edit")
  const rows = [...data]
  if (sort) rows.sort((a, b) => a.name.localeCompare(b.name) * (sort === "asc" ? 1 : -1))
  function commit(id: string, key: string, value: unknown) {
    setData((items) => items.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
    setEditing(null)
    setAction(`${key}: ${String(value)}`)
  }
  function input(row: (typeof seed)[number], key: "name" | "target") {
    return (
      <Input
        autoFocus
        aria-label="Edit value"
        type={key === "target" ? "number" : "text"}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => commit(row.id, key, key === "target" ? Number(text) : text)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setEditing(null)
          } else if (event.key === "Enter") {
            commit(row.id, key, key === "target" ? Number(text) : text)
          }
        }}
        className={
          key === "target"
            ? "h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
            : undefined
        }
      />
    )
  }
  return (
    <div className="w-full max-w-[522px] space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setData(seed)
            setSelected([])
            setSort(null)
            setEditing(null)
            setAction("No edit")
          }}
        >
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={() => setData([])}>
          Empty
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setData(Array.from({ length: 60 }, (_, i) => ({ ...seed[i % 3], id: `row-${i}`, name: `Person ${i + 1}` })))
          }
        >
          Many rows
        </Button>
      </div>
      <div className="h-64 overflow-auto rounded-lg border" data-audit-part="viewport">
        <Table className="w-[520px] table-fixed">
          <colgroup>
            {[40, 160, 100, 140, 80].map((width, i) => (
              <col key={i} style={{ width }} />
            ))}
          </colgroup>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead>
                <div className="flex items-center justify-center">
                  <Checkbox
                    aria-label="Select all"
                    checked={rows.length > 0 && rows.every((row) => selected.includes(row.id))}
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
                  />
                </div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                >
                  Name{sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ChevronsUpDown />}
                </Button>
              </TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={selected.includes(row.id) ? "selected" : undefined}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        aria-label="Select row"
                        checked={selected.includes(row.id)}
                        onCheckedChange={(checked) =>
                          setSelected(checked ? [...selected, row.id] : selected.filter((id) => id !== row.id))
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    onDoubleClick={() => {
                      setText(row.name)
                      setEditing(`${row.id}-name`)
                    }}
                  >
                    {editing === `${row.id}-name` ? input(row, "name") : row.name}
                  </TableCell>
                  <TableCell
                    className="text-right tabular-nums"
                    onDoubleClick={() => {
                      setText(String(row.target))
                      setEditing(`${row.id}-target`)
                    }}
                  >
                    {editing === `${row.id}-target` ? input(row, "target") : row.target}
                  </TableCell>
                  <TableCell onDoubleClick={() => setEditing(`${row.id}-role`)}>
                    {editing === `${row.id}-role` ? (
                      <Select defaultOpen value={row.role} onValueChange={(value) => commit(row.id, "role", value)}>
                        <SelectTrigger aria-label="Edit value">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {["Admin", "Member", "Viewer"].map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      row.role
                    )}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      aria-label="active"
                      checked={row.active}
                      onCheckedChange={(checked) => commit(row.id, "active", checked)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {action}
      </p>
    </div>
  )
}
