import * as React from "react"
import {
  Kanban,
  KanbanBoard,
  KanbanCard,
  KanbanCardTitle,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnCount,
  KanbanColumnHeader,
  KanbanColumnTitle,
  moveCard,
  moveColumn,
} from "@/components/ui/kanban"

export default function KanbanExample() {
  const [columns, setColumns] = React.useState([
    {
      id: "todo",
      title: "To do",
      cards: [
        { id: "1", title: "Write the docs" },
        { id: "2", title: "Record a demo" },
      ],
    },
    { id: "doing", title: "In progress", cards: [{ id: "3", title: "Port the calendar" }] },
    { id: "done", title: "Done", cards: [{ id: "4", title: "Ship the CLI" }] },
  ])
  return (
    <Kanban
      onCardMove={(d) => setColumns((prev) => moveCard(prev, d))}
      onColumnMove={(d) => setColumns((prev) => moveColumn(prev, d))}
      className="w-full"
    >
      <KanbanBoard>
        {columns.map((column) => (
          <KanbanColumn key={column.id} value={column.id} className="w-56">
            <KanbanColumnHeader>
              <KanbanColumnTitle>{column.title}</KanbanColumnTitle>
              <KanbanColumnCount>{column.cards.length}</KanbanColumnCount>
            </KanbanColumnHeader>
            <KanbanColumnContent>
              {column.cards.map((card) => (
                <KanbanCard key={card.id} value={card.id}>
                  <KanbanCardTitle>{card.title}</KanbanCardTitle>
                </KanbanCard>
              ))}
            </KanbanColumnContent>
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </Kanban>
  )
}
