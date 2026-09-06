import * as React from "react"
import { ArrowDownToLineIcon, ArrowUpToLineIcon, CheckIcon, SearchIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  VirtualList,
  VirtualListContent,
  VirtualListEmpty,
  VirtualListItem,
  VirtualListItems,
  VirtualListViewport,
  useVirtualList,
} from "@/components/ui/virtual-list"
import { cn } from "@/lib/utils"
import { contacts, LOG_COUNT, logLine } from "./data"

const levelClass = {
  info: "text-sky-600 dark:text-sky-400",
  debug: "text-muted-foreground",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-destructive",
} as const

function LogToolbar({ range }: { range: { start: number; end: number } | null }) {
  const list = useVirtualList()
  const [target, setTarget] = React.useState("50000")
  const go = () => {
    const n = Number(target)
    if (Number.isFinite(n)) list.scrollToIndex(n - 1, { align: "start" })
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          go()
        }}
      >
        <Input
          type="number"
          min={1}
          max={LOG_COUNT}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          aria-label="Line number"
          className="w-28"
        />
        <Button type="submit" variant="outline" size="sm">
          Go to line
        </Button>
      </form>
      <Button variant="outline" size="sm" onClick={() => list.scrollToIndex(0)}>
        <ArrowUpToLineIcon /> Top
      </Button>
      <Button variant="outline" size="sm" onClick={() => list.scrollToIndex(LOG_COUNT - 1, { align: "end" })}>
        <ArrowDownToLineIcon /> End
      </Button>
      <span className="ml-auto text-xs text-muted-foreground tabular-nums" data-testid="log-range">
        {range
          ? `Rendering ${range.end - range.start + 1} of ${LOG_COUNT.toLocaleString()} lines (${(range.start + 1).toLocaleString()}–${(range.end + 1).toLocaleString()})`
          : "Empty"}
      </span>
    </div>
  )
}

function LogStream() {
  const [range, setRange] = React.useState<{ start: number; end: number } | null>(null)
  return (
    <VirtualList
      count={LOG_COUNT}
      estimateSize={(index) => (logLine(index).message.includes("\n") ? 56 : 28)}
      overscan={8}
      onRangeChange={setRange}
      className="gap-3"
    >
      <LogToolbar range={range} />
      <VirtualListViewport className="h-80 rounded-lg border bg-muted/30 font-mono text-xs" aria-label="Log lines">
        <VirtualListContent>
          <VirtualListItems>
            {(item) => {
              const line = logLine(item.index)
              return (
                <VirtualListItem
                  index={item.index}
                  className="flex gap-3 border-b border-border/50 px-3 py-1.5 whitespace-pre-wrap hover:bg-muted"
                >
                  <span className="w-14 shrink-0 text-right text-muted-foreground tabular-nums select-none">
                    {line.id}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{line.time}</span>
                  <span className={cn("w-11 shrink-0 font-semibold uppercase", levelClass[line.level])}>
                    {line.level}
                  </span>
                  <span className="min-w-0 flex-1">{line.message}</span>
                </VirtualListItem>
              )
            }}
          </VirtualListItems>
        </VirtualListContent>
      </VirtualListViewport>
    </VirtualList>
  )
}

/** A virtualized listbox: focus stays on the viewport and `aria-activedescendant` names the active row. */
function ContactsListbox({ query }: { query: string }) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? contacts.filter((c) => c.name.toLowerCase().includes(q) || c.team.toLowerCase().includes(q)) : contacts
  }, [query])
  const [active, setActive] = React.useState(0)
  const [selected, setSelected] = React.useState<string | null>(null)
  React.useEffect(() => setActive(0), [query])
  const baseId = React.useId()
  const idOf = (index: number) => `${baseId}-${index}`

  return (
    <VirtualList count={filtered.length} estimateSize={44} overscan={6} getItemKey={(i) => filtered[i].id}>
      <ContactsViewport
        active={active}
        setActive={setActive}
        count={filtered.length}
        onPick={(index) => setSelected(filtered[index]?.id ?? null)}
        activeId={filtered.length ? idOf(active) : undefined}
      >
        <VirtualListContent>
          <VirtualListItems>
            {(item) => {
              const c = filtered[item.index]
              const isActive = item.index === active
              const isSelected = c.id === selected
              return (
                <VirtualListItem
                  index={item.index}
                  id={idOf(item.index)}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive ? "" : undefined}
                  data-selected={isSelected ? "" : undefined}
                  className="flex h-11 items-center gap-3 px-3 text-sm data-selected:font-medium data-active:bg-muted"
                  onMouseMove={() => setActive(item.index)}
                  onClick={() => setSelected(c.id)}
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {c.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate">{c.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{c.email}</span>
                  </span>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {c.team}
                  </Badge>
                  {isSelected && <CheckIcon className="size-4 text-primary" />}
                </VirtualListItem>
              )
            }}
          </VirtualListItems>
        </VirtualListContent>
        <VirtualListEmpty>No contacts match</VirtualListEmpty>
      </ContactsViewport>
      <p className="text-xs text-muted-foreground">
        {filtered.length.toLocaleString()} contacts · selected:{" "}
        <span className="text-foreground" data-testid="contact-selected">
          {contacts.find((c) => c.id === selected)?.name ?? "none"}
        </span>
      </p>
    </VirtualList>
  )
}

function ContactsViewport({
  active,
  setActive,
  count,
  onPick,
  activeId,
  children,
}: {
  active: number
  setActive: (index: number) => void
  count: number
  onPick: (index: number) => void
  activeId?: string
  children: React.ReactNode
}) {
  const list = useVirtualList()
  const move = (next: number) => {
    const clamped = Math.max(0, Math.min(count - 1, next))
    setActive(clamped)
    list.scrollToIndex(clamped)
  }
  return (
    <VirtualListViewport
      role="listbox"
      tabIndex={0}
      aria-label="Actors"
      aria-activedescendant={activeId}
      className="h-80 rounded-lg border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      onKeyDown={(event) => {
        const page = 7
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault()
            move(active + 1)
            break
          case "ArrowUp":
            event.preventDefault()
            move(active - 1)
            break
          case "PageDown":
            event.preventDefault()
            move(active + page)
            break
          case "PageUp":
            event.preventDefault()
            move(active - page)
            break
          case "Home":
            event.preventDefault()
            move(0)
            break
          case "End":
            event.preventDefault()
            move(count - 1)
            break
          case "Enter":
          case " ":
            event.preventDefault()
            onPick(active)
            break
        }
      }}
    >
      {children}
    </VirtualListViewport>
  )
}

export function VirtualListPage() {
  const [query, setQuery] = React.useState("")
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit log</h2>
        <p className="text-muted-foreground">Every event in the workspace, searchable, however many there are.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            100,000 events with mixed heights. Jump to any line; rows are measured as they appear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogStream />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Actors</CardTitle>
          <CardDescription>
            Everyone who has ever appeared in the log. Focus the list and use the arrows, Page Up/Down, Home/End, Enter.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Filter by name or team"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <ContactsListbox query={query} />
        </CardContent>
      </Card>
    </div>
  )
}
