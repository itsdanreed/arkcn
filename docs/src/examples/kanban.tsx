import * as React from "react"
import { Kanban, moveCard, moveColumn } from "@/components/ui/kanban"

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
    <Kanban.Root
      onCardMove={(d) => setColumns((prev) => moveCard(prev, d))}
      onColumnMove={(d) => setColumns((prev) => moveColumn(prev, d))}
      className="w-full"
    >
      <Kanban.Board>
        {columns.map((column) => (
          <Kanban.Column key={column.id} value={column.id} className="w-56">
            <Kanban.ColumnHeader>
              <Kanban.ColumnTitle>{column.title}</Kanban.ColumnTitle>
              <Kanban.ColumnCount>{column.cards.length}</Kanban.ColumnCount>
            </Kanban.ColumnHeader>
            <Kanban.ColumnContent>
              {column.cards.map((card) => (
                <Kanban.Card key={card.id} value={card.id}>
                  <Kanban.CardTitle>{card.title}</Kanban.CardTitle>
                </Kanban.Card>
              ))}
            </Kanban.ColumnContent>
          </Kanban.Column>
        ))}
      </Kanban.Board>
    </Kanban.Root>
  )
}
