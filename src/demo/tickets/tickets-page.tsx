import * as React from "react"
import { formatDistanceToNowStrict } from "date-fns"
import {
  ArrowLeftIcon,
  CheckCheckIcon,
  Clock3Icon,
  InboxIcon,
  LockIcon,
  MailIcon,
  PanelRightIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  agents,
  me,
  priorities,
  statuses,
  tickets as initialTickets,
  type Person,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "./data"

/* ------------------------------- helpers ---------------------------------- */

type View = "inbox" | "mine" | "unassigned" | "closed"

const views: { value: View; label: string }[] = [
  { value: "inbox", label: "Inbox" },
  { value: "mine", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
  { value: "closed", label: "Closed" },
]

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
const UNASSIGNED = "__unassigned__"
const assigneeCollection = createListCollection({
  items: [{ id: UNASSIGNED, name: "Unassigned" }, ...agents.map((a) => ({ id: a.id, name: a.name }))],
  itemToString: (a) => a.name,
  itemToValue: (a) => a.id,
})

const ago = (date: Date) => {
  if (Math.abs(Date.now() - date.getTime()) < 60_000) return "now"
  return formatDistanceToNowStrict(date)
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ months?/, "mo")
}

function PersonAvatar({ person, className }: { person: Person; className?: string }) {
  return (
    <Avatar className={cn("size-8", className)}>
      {person.avatar && <AvatarImage src={person.avatar} alt={person.name} />}
      <AvatarFallback className="text-xs">{person.initials}</AvatarFallback>
    </Avatar>
  )
}

function StatusDot({ status, className }: { status: TicketStatus; className?: string }) {
  const meta = statuses.find((s) => s.value === status)!
  return (
    <span aria-label={meta.label} className={cn("inline-block size-2 shrink-0 rounded-full", meta.dot, className)} />
  )
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  // Only escalated priorities are shown in the list; normal/low add noise without changing behaviour.
  if (priority === "low" || priority === "normal") return null
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 px-1.5 text-[10px] capitalize",
        priority === "urgent"
          ? "border-destructive/40 text-destructive"
          : "border-amber-500/40 text-amber-700 dark:text-amber-400"
      )}
    >
      {priority}
    </Badge>
  )
}

/* -------------------------------- list ------------------------------------ */

function TicketList({
  tickets,
  selectedId,
  view,
  onViewChange,
  search,
  onSearchChange,
  onSelect,
  onNew,
}: {
  tickets: Ticket[]
  selectedId: number | null
  view: View
  onViewChange: (view: View) => void
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: number) => void
  onNew: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold tracking-tight">Tickets</h2>
        <Button size="sm" onClick={onNew}>
          <PlusIcon /> New
        </Button>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-2">
        <SegmentGroup
          value={view}
          onValueChange={({ value }) => value && onViewChange(value as View)}
          className="w-full *:data-[slot=segment-group-item]:flex-1"
        >
          <SegmentGroupIndicator />
          {views.map((v) => (
            <SegmentGroupItem key={v.value} value={v.value}>
              {v.label}
            </SegmentGroupItem>
          ))}
        </SegmentGroup>
        <InputGroup className="h-8">
          <InputGroupAddon>
            <SearchIcon className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search tickets"
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </InputGroup>
      </div>
      <Separator />
      <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {tickets.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing here. Nice.</li>
        )}
        {tickets.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              data-selected={t.id === selectedId ? "" : undefined}
              data-unread={t.unread ? "" : undefined}
              onClick={() => onSelect(t.id)}
              className="group/ticket flex w-full flex-col gap-1 border-b px-4 py-3 text-start transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 data-selected:bg-muted"
            >
              <div className="flex items-center gap-2">
                <StatusDot status={t.status} />
                <span className="min-w-0 flex-1 truncate text-sm group-data-unread/ticket:font-semibold">
                  {t.subject}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{ago(t.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2 ps-4">
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {t.requester.name} · #{t.id}
                </span>
                <PriorityBadge priority={t.priority} />
                {t.assignee ? (
                  <PersonAvatar person={t.assignee} className="size-5" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">unassigned</span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------- detail ----------------------------------- */

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function Properties({ ticket, onChange }: { ticket: Ticket; onChange: (patch: Partial<Ticket>) => void }) {
  const overdue = ticket.dueAt.getTime() < Date.now() && (ticket.status === "open" || ticket.status === "pending")
  return (
    <div className="flex flex-col gap-4">
      <PropertyRow label="Assignee">
        <Select
          collection={assigneeCollection}
          value={[ticket.assignee?.id ?? UNASSIGNED]}
          onValueChange={({ value }) => onChange({ assignee: agents.find((a) => a.id === value[0]) ?? null })}
        >
          <SelectControl>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
          </SelectControl>
          <SelectContent>
            {assigneeCollection.items.map((a) => (
              <SelectItem key={a.id} item={a}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyRow>
      <PropertyRow label="Priority">
        <Select
          collection={priorityCollection}
          value={[ticket.priority]}
          onValueChange={({ value }) => onChange({ priority: value[0] as TicketPriority })}
        >
          <SelectControl>
            <SelectTrigger className="w-full">
              <SelectValue />
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
      </PropertyRow>
      <PropertyRow label="Requester">
        <div className="flex items-center gap-2">
          <PersonAvatar person={ticket.requester} className="size-7" />
          <div className="min-w-0">
            <p className="truncate text-sm">{ticket.requester.name}</p>
            <p className="truncate text-xs text-muted-foreground">{ticket.requester.email}</p>
          </div>
        </div>
      </PropertyRow>
      <PropertyRow label="First response due">
        <p className={cn("inline-flex items-center gap-1.5 text-sm", overdue && "text-destructive")}>
          <Clock3Icon className="size-3.5" />
          {overdue ? `${ago(ticket.dueAt)} overdue` : `in ${ago(ticket.dueAt)}`}
        </p>
      </PropertyRow>
      <PropertyRow label="Tags">
        <div className="flex flex-wrap gap-1">
          {ticket.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </PropertyRow>
      <PropertyRow label="Channel">
        <p className="text-sm capitalize">{ticket.channel}</p>
      </PropertyRow>
    </div>
  )
}

function TicketDetail({
  ticket,
  onChange,
  onBack,
  onReply,
}: {
  ticket: Ticket
  onChange: (patch: Partial<Ticket>) => void
  onBack: () => void
  onReply: (body: string, kind: "agent" | "note", close: boolean) => void
}) {
  const [mode, setMode] = React.useState<"agent" | "note">("agent")
  const [draft, setDraft] = React.useState("")
  const [propsOpen, setPropsOpen] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [ticket.id, ticket.messages.length])

  const send = (close: boolean) => {
    if (!draft.trim()) return
    onReply(draft.trim(), mode, close)
    setDraft("")
  }

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Back to list" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{ticket.subject}</h3>
            <p className="truncate text-xs text-muted-foreground">
              #{ticket.id} · {ticket.requester.name} · opened{" "}
              {ago(ticket.createdAt) === "now" ? "just now" : `${ago(ticket.createdAt)} ago`}
            </p>
          </div>
          <Select
            collection={statusCollection}
            value={[ticket.status]}
            onValueChange={({ value }) => onChange({ status: value[0] as TicketStatus })}
            positioning={{ placement: "bottom-end", sameWidth: false }}
          >
            <SelectControl>
              <SelectTrigger className="gap-2">
                <StatusDot status={ticket.status} />
                <SelectValue />
              </SelectTrigger>
            </SelectControl>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} item={s}>
                  <StatusDot status={s.value} className="me-1" />
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label="Ticket details"
                onClick={() => setPropsOpen(true)}
              >
                <PanelRightIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Details</TooltipContent>
          </Tooltip>
        </header>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {ticket.messages.map((m) => (
            <div
              key={m.id}
              data-kind={m.kind}
              className="group/msg flex gap-3 data-[kind=note]:rounded-lg data-[kind=note]:border data-[kind=note]:border-amber-500/30 data-[kind=note]:bg-amber-500/5 data-[kind=note]:p-3"
            >
              <PersonAvatar person={m.author} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">{m.author.name}</span>
                  {m.kind === "note" && (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <LockIcon className="size-3" /> Internal note
                    </span>
                  )}
                  <span className="text-muted-foreground">{ago(m.at) === "now" ? "just now" : `${ago(m.at)} ago`}</span>
                </div>
                <p className="mt-1 text-sm/relaxed whitespace-pre-line">{m.body}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className={cn("border-t p-3 transition-colors", mode === "note" && "bg-amber-500/5")}>
          <Tabs value={mode} onValueChange={({ value }) => setMode(value as "agent" | "note")} className="gap-2">
            <TabsList>
              <TabsTrigger value="agent">
                <MailIcon /> Reply
              </TabsTrigger>
              <TabsTrigger value="note">
                <LockIcon /> Internal note
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(false)
            }}
            placeholder={mode === "note" ? "Add a note only your team can see" : `Reply to ${ticket.requester.name}…`}
            className="mt-2 min-h-20 resize-none"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">⌘↵ to send</p>
            <div className="flex gap-2">
              {mode === "agent" && (
                <Button variant="outline" size="sm" onClick={() => send(true)} disabled={!draft.trim()}>
                  <CheckCheckIcon /> Send & solve
                </Button>
              )}
              <Button size="sm" onClick={() => send(false)} disabled={!draft.trim()}>
                <SendIcon /> {mode === "note" ? "Add note" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden w-72 shrink-0 border-s p-4 xl:block">
        <Properties ticket={ticket} onChange={onChange} />
      </aside>
      <Sheet open={propsOpen} onOpenChange={({ open }) => setPropsOpen(open)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ticket #{ticket.id}</SheetTitle>
            <SheetDescription className="truncate">{ticket.subject}</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Properties ticket={ticket} onChange={onChange} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ------------------------------ new ticket -------------------------------- */

function NewTicketDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (subject: string, requester: string, body: string) => void
}) {
  const [subject, setSubject] = React.useState("")
  const [requester, setRequester] = React.useState("")
  const [body, setBody] = React.useState("")
  const valid = subject.trim() && requester.trim() && body.trim()
  return (
    <Dialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>New ticket</DialogTitle>
          <DialogDescription>Log a request on behalf of a customer.</DialogDescription>
        </DialogHeader>
        <form
          id="new-ticket-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valid) return
            onCreate(subject.trim(), requester.trim(), body.trim())
            setSubject("")
            setRequester("")
            setBody("")
          }}
        >
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="nt-requester">Requester email</FieldLabel>
              <Input
                id="nt-requester"
                type="email"
                placeholder="name@company.com"
                value={requester}
                onChange={(e) => setRequester(e.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="nt-subject">Subject</FieldLabel>
              <Input
                id="nt-subject"
                placeholder="Short summary"
                value={subject}
                onChange={(e) => setSubject(e.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="nt-body">Message</FieldLabel>
              <Textarea
                id="nt-body"
                className="min-h-24 resize-none"
                value={body}
                onChange={(e) => setBody(e.currentTarget.value)}
              />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="new-ticket-form" disabled={!valid}>
            Create ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------- page ----------------------------------- */

/** Ticket system mock: a queue on the left, one conversation at a time on the right. */
export function TicketsPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets)
  const [view, setView] = React.useState<View>("inbox")
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [mobileDetail, setMobileDetail] = React.useState(false)
  const [newOpen, setNewOpen] = React.useState(false)

  const term = search.trim().toLowerCase()
  const visible = tickets
    .filter((t) => {
      if (view === "closed") return t.status === "solved" || t.status === "closed"
      if (t.status === "solved" || t.status === "closed") return false
      if (view === "mine") return t.assignee?.id === me.id
      if (view === "unassigned") return !t.assignee
      return true
    })
    .filter(
      (t) =>
        !term ||
        [t.subject, t.requester.name, t.requester.email, String(t.id), ...t.tags].some((s) =>
          s.toLowerCase().includes(term)
        )
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const selected = tickets.find((t) => t.id === selectedId) ?? null

  const update = (id: number, patch: Partial<Ticket>) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t)))

  const select = (id: number) => {
    setSelectedId(id)
    setMobileDetail(true)
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, unread: false } : t)))
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border bg-card">
      <div className={cn("w-full shrink-0 lg:w-96 lg:border-e", mobileDetail && "max-lg:hidden")}>
        <TicketList
          tickets={visible}
          selectedId={selectedId}
          view={view}
          onViewChange={setView}
          search={search}
          onSearchChange={setSearch}
          onSelect={select}
          onNew={() => setNewOpen(true)}
        />
      </div>
      <div className={cn("min-w-0 flex-1", !mobileDetail && "max-lg:hidden")}>
        {selected ? (
          <TicketDetail
            key={selected.id}
            ticket={selected}
            onChange={(patch) => update(selected.id, patch)}
            onBack={() => setMobileDetail(false)}
            onReply={(body, kind, close) => {
              const message = { id: `${selected.id}-${Date.now()}`, author: me, kind, body, at: new Date() }
              update(selected.id, {
                messages: [...selected.messages, message],
                status: close ? "solved" : kind === "agent" ? "pending" : selected.status,
                assignee: selected.assignee ?? me,
              })
              toast.success(close ? "Reply sent and ticket solved" : kind === "note" ? "Note added" : "Reply sent")
            }}
          />
        ) : (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>Pick a ticket</EmptyTitle>
              <EmptyDescription>
                {visible.length} in {views.find((v) => v.value === view)?.label.toLowerCase()}. Newest first.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
      <NewTicketDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(subject, email, body) => {
          const requester = { id: email, name: email.split("@")[0], email, initials: email.slice(0, 2).toUpperCase() }
          const id = Math.max(...tickets.map((t) => t.id)) + 1
          const now = new Date()
          setTickets((prev) => [
            {
              id,
              subject,
              status: "open",
              priority: "normal",
              requester,
              assignee: me,
              tags: [],
              channel: "form",
              createdAt: now,
              updatedAt: now,
              dueAt: new Date(now.getTime() + 24 * 3_600_000),
              unread: false,
              messages: [{ id: `${id}-0`, author: requester, kind: "customer", body, at: now }],
            },
            ...prev,
          ])
          setNewOpen(false)
          select(id)
        }}
      />
    </div>
  )
}
