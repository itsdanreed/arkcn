import { useState } from "react"
import { GripVerticalIcon, PlusIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Item, ItemHeader, ItemTitle, ItemDescription } from "../ui/item"

export default function Example() {
  const [readOnly, setReadOnly] = useState(false)
  return (
    <div className="space-y-4">
      <Button variant="outline" aria-pressed={readOnly} onClick={() => setReadOnly(!readOnly)}>
        Read only
      </Button>
      <div className="w-72 space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-xs" disabled={readOnly} aria-label="Drag To do column">
            <GripVerticalIcon />
          </Button>
          <ItemTitle>To do</ItemTitle>
          <Badge variant="secondary">2</Badge>
        </div>
        {[
          { title: "Write the docs", description: "Document the public API and keyboard controls." },
          { title: "Record a demo", description: "Show the core workflow." },
        ].map((card) => (
          <Item key={card.title} variant="outline" tabIndex={readOnly ? undefined : 0} aria-label={card.title}>
            <ItemHeader>
              <ItemTitle>{card.title}</ItemTitle>
              <Button variant="ghost" size="icon-xs" disabled={readOnly} aria-label={`Drag ${card.title}`}>
                <GripVerticalIcon />
              </Button>
            </ItemHeader>
            <ItemDescription>{card.description}</ItemDescription>
          </Item>
        ))}
        <Button variant="ghost" size="sm" disabled={readOnly}>
          <PlusIcon />
          Add card
        </Button>
        <p className="text-sm text-muted-foreground">No cards</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Item, Button, and Badge reference only. Shadcn has no Kanban board or drag-and-drop states.
      </p>
    </div>
  )
}
