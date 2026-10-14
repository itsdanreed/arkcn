import { cn } from "cn"
import { PlusCircle, Check, Settings2, GripVertical, Archive, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandEmpty,
  CommandItem,
  CommandSeparator,
} from "../ui/command"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuGroup } from "../ui/dropdown-menu"
import { useAuditMotion } from "../../src/audit-motion"
import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Ellipsis, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "../ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"

// Independent composition of raw Nova primitives. Container, header/menu and
// pagination classes come from the pinned shadcn tasks example. Only primitive
// API wiring is adapted from Radix to Base UI; no raw component styles are edited.
const data = ["Write docs", "Fix build", "Ship CLI", "Review PR", "Plan sprint", "Add tests", "Fix icons", "Release"]
function CoreExample() {
  const { trace } = useAuditMotion('[role="menu"]', 250)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<"asc" | "desc" | null>(null)
  const [hidden, setHidden] = useState(false)
  const [page, setPage] = useState(0)
  const [action, setAction] = useState("No action")
  const filtered = data.filter((title) => title.toLowerCase().includes(query.toLowerCase()))
  if (sort) filtered.sort((a, b) => a.localeCompare(b) * (sort === "asc" ? 1 : -1))
  const pages = Math.max(1, Math.ceil(filtered.length / 4))
  const rows = filtered.slice(page * 4, page * 4 + 4)
  const all = rows.length > 0 && rows.every((title) => selected.includes(title))
  const some = rows.some((title) => selected.includes(title))
  return (
    <div className="w-full space-y-6">
      <output data-audit-motion hidden>
        {trace}
      </output>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setQuery("")
          setSelected([])
          setSort(null)
          setHidden(false)
          setPage(0)
          setAction("No action")
        }}
      >
        Reset table
      </Button>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter tasks…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setPage(0)
              }}
            >
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-md border" data-audit-part="container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    aria-label="Select all"
                    checked={all}
                    indeterminate={!all && some}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? [...new Set([...selected, ...rows])]
                          : selected.filter((title) => !rows.includes(title))
                      )
                    }
                  />
                </TableHead>
                {!hidden && (
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" />
                          }
                        >
                          <span>Title</span>
                          {sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ChevronsUpDown />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setSort("asc")}>
                            <ArrowUp />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSort("desc")}>
                            <ArrowDown />
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setHidden(true)}>
                            <EyeOff />
                            Hide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                )}
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((title) => (
                  <TableRow key={title} data-state={selected.includes(title) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        aria-label="Select row"
                        checked={selected.includes(title)}
                        onCheckedChange={(checked) =>
                          setSelected(checked ? [...selected, title] : selected.filter((value) => value !== title))
                        }
                      />
                    </TableCell>
                    {!hidden && <TableCell>{title}</TableCell>}
                    <TableCell>Todo</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted" />}
                        >
                          <Ellipsis />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => setAction(`Edit ${title}`)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAction(`Copy ${title}`)}>Make a copy</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setAction(`Delete ${title}`)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hidden ? 3 : 4} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page + 1} of {pages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page + 1 >= pages}
              onClick={() => setPage(page + 1)}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selected.length} selected. {action}.
      </p>
    </div>
  )
}

export default function Example() {
  const [advanced, setAdvanced] = useState(true)
  const [version, setVersion] = useState(0)
  if (!advanced)
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setAdvanced(true)}>
          Advanced controls
        </Button>
        <CoreExample />
      </div>
    )
  return (
    <div className="w-full space-y-6">
      <Button variant="outline" size="sm" onClick={() => setVersion(version + 1)}>
        Reset table
      </Button>
      <Button variant="outline" size="sm" onClick={() => setAdvanced(false)}>
        Core controls
      </Button>
      <AdvancedTable key={version} />
    </div>
  )
}
const advancedRows = [
  { id: "docs", title: "Write docs", status: "Todo" },
  { id: "build", title: "Fix build", status: "Doing" },
  { id: "cli", title: "Ship CLI", status: "Done" },
  { id: "review", title: "Review PR", status: "Todo" },
]
function AdvancedTable() {
  const [filters, setFilters] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [visibility, setVisibility] = useState({ title: true, status: true })
  const [size, setSize] = useState(4)
  const [page, setPage] = useState(0)
  const [action, setAction] = useState("No action")
  const { trace } = useAuditMotion('[data-slot="popover-content"]', 260)
  const filtered = advancedRows.filter((row) => !filters.length || filters.includes(row.status))
  const rows = filtered.slice(page * size, (page + 1) * size)
  const count = filtered.filter((row) => selected.includes(row.id)).length
  const all = rows.length > 0 && rows.every((row) => selected.includes(row.id))
  const some = rows.some((row) => selected.includes(row.id))
  function toggle(value: string) {
    setFilters(filters.includes(value) ? filters.filter((item) => item !== value) : [...filters, value])
    setPage(0)
  }
  return (
    <div className="flex flex-col gap-4">
      <output data-advanced-motion hidden>
        {trace}
      </output>
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="h-8 border-dashed" />}>
            <PlusCircle />
            Status
            {filters.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  {filters.length}
                </Badge>
                <div className="hidden gap-1 lg:flex">
                  {filters.length > 2 ? (
                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                      {filters.length} selected
                    </Badge>
                  ) : (
                    filters.map((value) => (
                      <Badge key={value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {value}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Status" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {["Todo", "Doing", "Done"].map((value) => (
                    <CommandItem key={value} value={value} onSelect={() => toggle(value)}>
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border",
                          filters.includes(value)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input [&_svg]:invisible"
                        )}
                      >
                        <Check className="size-3.5 text-primary-foreground" />
                      </div>
                      <span>{value}</span>
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs text-muted-foreground">
                        {advancedRows.filter((row) => row.status === value).length}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {filters.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFilters([])
                          setPage(0)
                        }}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex" />}>
            <Settings2 />
            View
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["title", "status"] as const).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={visibility[key]}
                  onCheckedChange={(checked) => setVisibility({ ...visibility, [key]: checked })}
                >
                  {key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="sr-only">Reorder</span>
              </TableHead>
              <TableHead>
                <Checkbox
                  aria-label="Select all"
                  checked={all}
                  indeterminate={!all && some}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked
                        ? [...new Set([...selected, ...rows.map((row) => row.id)])]
                        : selected.filter((id) => !rows.some((row) => row.id === id))
                    )
                  }
                />
              </TableHead>
              {visibility.title && <TableHead>Title</TableHead>}
              {visibility.status && <TableHead>Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={selected.includes(row.id) ? "selected" : undefined}>
                  <TableCell>
                    {!filters.length && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:bg-transparent"
                        aria-label={`Reorder ${row.title}`}
                      >
                        <GripVertical className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      aria-label="Select row"
                      checked={selected.includes(row.id)}
                      onCheckedChange={(checked) =>
                        setSelected(checked ? [...selected, row.id] : selected.filter((id) => id !== row.id))
                      }
                    />
                  </TableCell>
                  {visibility.title && <TableCell>{row.title}</TableCell>}
                  {visibility.status && <TableCell>{row.status}</TableCell>}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2 + Number(visibility.title) + Number(visibility.status)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={String(size)}
            onValueChange={(value) => {
              setSize(Number(value))
              setPage(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[2, 4, 8].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / size))}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!page}
            onClick={() => setPage(page - 1)}
            aria-label="Go to previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={(page + 1) * size >= filtered.length}
            onClick={() => setPage(page + 1)}
            aria-label="Go to next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <Popover
        open={count > 0}
        onOpenChange={(open) => {
          if (!open) setSelected([])
        }}
      >
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>Selection actions</PopoverTrigger>
        <PopoverContent className="w-max flex-row items-center" align="start">
          <Button
            variant="outline"
            size="icon"
            className="size-6 rounded-full"
            aria-label="Clear selection"
            onClick={() => setSelected([])}
          >
            <X />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-1 text-sm">
            <Badge className="min-w-8 justify-center rounded-lg">{count}</Badge>
            <span>rows selected</span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Archive selected"
            onClick={() => setAction(`Archive ${count}`)}
          >
            <Archive />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Delete selected" disabled>
            <Trash2 />
          </Button>
        </PopoverContent>
      </Popover>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {count} selected. {action}.
      </p>
    </div>
  )
}
