import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Kanban, moveCard, moveColumn } from "@/components/ui/kanban"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"

const initial = [
  {
    id: "todo",
    title: "To do",
    cards: [
      { id: "docs", title: "Write the docs", description: "Document the public API and keyboard controls." },
      { id: "demo", title: "Record a demo", description: "Show the core workflow." },
    ],
  },
  { id: "done", title: "Done", cards: [] as { id: string; title: string; description: string }[] },
]

export default function Example() {
  const [columns, setColumns] = useState(initial)
  const [readOnly, setReadOnly] = useState(false)
  const [preview, setPreview] = useState(false)
  const { trace } = useAuditMotion('[data-slot="kanban-card"], [data-slot="kanban-column-handle"]')
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setColumns(initial)}>
          Reset
        </Button>
        <Button variant="outline" aria-pressed={readOnly} onClick={() => setReadOnly(!readOnly)}>
          Read only
        </Button>
        <Button variant="outline" aria-pressed={preview} onClick={() => setPreview(!preview)}>
          Drop preview
        </Button>
      </div>
      <Kanban.Root
        onCardMove={(d) => setColumns((prev) => moveCard(prev, d))}
        onColumnMove={(d) => setColumns((prev) => moveColumn(prev, d))}
      >
        <Kanban.Board>
          {columns.map((column, index) => (
            <Kanban.Column key={column.id} value={column.id} draggable={!readOnly}>
              <Kanban.ColumnHeader>
                <Kanban.ColumnHandle aria-label={`Drag ${column.title} column`} />
                <Kanban.ColumnTitle>{column.title}</Kanban.ColumnTitle>
                <Kanban.ColumnCount>{column.cards.length}</Kanban.ColumnCount>
              </Kanban.ColumnHeader>
              <Kanban.ColumnContent>
                {preview && index === 0 && <Kanban.DropSlot height={96} />}
                {column.cards.map((card) => (
                  <Kanban.Card key={card.id} value={card.id} draggable={!readOnly} aria-label={card.title}>
                    <Kanban.CardHeader>
                      <Kanban.CardTitle>{card.title}</Kanban.CardTitle>
                      <Kanban.CardHandle aria-label={`Drag ${card.title}`} />
                    </Kanban.CardHeader>
                    <Kanban.CardDescription>{card.description}</Kanban.CardDescription>
                  </Kanban.Card>
                ))}
                {column.cards.length === 0 && <Kanban.Empty>No cards</Kanban.Empty>}
              </Kanban.ColumnContent>
              <Kanban.ColumnFooter>
                <Kanban.AddTrigger
                  disabled={readOnly}
                  onClick={() =>
                    setColumns((prev) =>
                      prev.map((c) =>
                        c.id === column.id
                          ? {
                              ...c,
                              cards: [
                                ...c.cards,
                                { id: `new-${Date.now()}`, title: "New task", description: "Add task details." },
                              ],
                            }
                          : c
                      )
                    )
                  }
                >
                  <PlusIcon />
                  Add card
                </Kanban.AddTrigger>
              </Kanban.ColumnFooter>
              {preview && index === 0 && <Kanban.DropIndicator edge="left" gap="1rem" />}
            </Kanban.Column>
          ))}
        </Kanban.Board>
      </Kanban.Root>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <output hidden data-audit-order>
        {JSON.stringify(columns.map((c) => ({ id: c.id, cards: c.cards.map((card) => card.id) })))}
      </output>
    </div>
  )
}
