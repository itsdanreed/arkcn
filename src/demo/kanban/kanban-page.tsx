import * as React from "react"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Kanban,
  KanbanAddTrigger,
  KanbanBoard,
  KanbanCard,
  KanbanCardFooter,
  KanbanCardHeader,
  KanbanCardTitle,
  KanbanColumn,
  KanbanColumnActions,
  KanbanColumnContent,
  KanbanColumnCount,
  KanbanColumnFooter,
  KanbanColumnHandle,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanEmpty,
  moveCard,
  moveColumn,
} from "@/components/ui/kanban"
import { generateTasks, labels, priorities, statuses, type Task } from "@/demo/tasks/data"

type Column = { id: string; title: string; cards: Task[] }

function buildColumns(): Column[] {
  const tasks = generateTasks(24, 777)
  return statuses.map((status) => ({
    id: status.value,
    title: status.label,
    cards: tasks.filter((t) => t.status === status.value),
  }))
}

/** Kanban demo on the tasks data: drag cards between columns, reorder columns by their handle. */
export function KanbanPage() {
  const [columns, setColumns] = React.useState<Column[]>(buildColumns)
  const counter = React.useRef(1)

  const addCard = (columnId: string) => {
    const id = `TASK-${9000 + counter.current++}`
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? {
              ...c,
              cards: [...c.cards, { id, title: "New task", status: columnId, label: "feature", priority: "medium" }],
            }
          : c
      )
    )
  }

  const clearColumn = (columnId: string) =>
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, cards: [] } : c)))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Board</h2>
          <p className="text-muted-foreground">Drag tasks between columns. Drag a column by its handle to reorder.</p>
        </div>
        <Button variant="outline" onClick={() => setColumns(buildColumns())}>
          Reset board
        </Button>
      </div>
      <Kanban
        onCardMove={(details) => {
          setColumns((prev) =>
            moveCard(prev, details).map((c) => ({
              ...c,
              cards: c.cards.map((card) => (card.id === details.cardId ? { ...card, status: c.id } : card)),
            }))
          )
          if (details.fromColumnId !== details.toColumnId) {
            const to = columns.find((c) => c.id === details.toColumnId)
            toast.success(`${details.cardId} moved to ${to?.title ?? details.toColumnId}`)
          }
        }}
        onColumnMove={(details) => setColumns((prev) => moveColumn(prev, details))}
      >
        <KanbanBoard>
          {columns.map((column) => {
            const status = statuses.find((s) => s.value === column.id)
            return (
              <KanbanColumn key={column.id} value={column.id}>
                <KanbanColumnHeader>
                  <KanbanColumnHandle />
                  {status && <status.icon className="size-4 text-muted-foreground" />}
                  <KanbanColumnTitle>{column.title}</KanbanColumnTitle>
                  <KanbanColumnCount>{column.cards.length}</KanbanColumnCount>
                  <KanbanColumnActions>
                    <DropdownMenu positioning={{ placement: "bottom-end" }}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Column actions">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem value="add" onSelect={() => addCard(column.id)}>
                          Add task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem value="clear" variant="destructive" onSelect={() => clearColumn(column.id)}>
                          Clear column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </KanbanColumnActions>
                </KanbanColumnHeader>
                <KanbanColumnContent>
                  {column.cards.length === 0 && <KanbanEmpty>Drop tasks here</KanbanEmpty>}
                  {column.cards.map((task) => {
                    const label = labels.find((l) => l.value === task.label)
                    const priority = priorities.find((p) => p.value === task.priority)
                    return (
                      <KanbanCard key={task.id} value={task.id}>
                        <KanbanCardHeader>
                          <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
                          {label && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              {label.label}
                            </Badge>
                          )}
                        </KanbanCardHeader>
                        <KanbanCardTitle className="line-clamp-2">{task.title}</KanbanCardTitle>
                        {priority && (
                          <KanbanCardFooter>
                            <priority.icon className="size-3.5" />
                            <span>{priority.label}</span>
                          </KanbanCardFooter>
                        )}
                      </KanbanCard>
                    )
                  })}
                </KanbanColumnContent>
                <KanbanColumnFooter>
                  <KanbanAddTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => addCard(column.id)}>
                      <PlusIcon /> Add task
                    </Button>
                  </KanbanAddTrigger>
                </KanbanColumnFooter>
              </KanbanColumn>
            )
          })}
        </KanbanBoard>
      </Kanban>
    </div>
  )
}
