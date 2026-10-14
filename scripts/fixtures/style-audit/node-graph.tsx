import { useState } from "react"
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Item, ItemContent, ItemTitle, ItemDescription } from "../ui/item"

export default function Example() {
  const [zoom, setZoom] = useState(1)
  return (
    <div className="space-y-4">
      <div className="w-56 space-y-4">
        {["Price", "Tax rate", "Multiply"].map((title) => (
          <Item key={title} variant="outline" tabIndex={0} aria-label={title}>
            <ItemContent>
              <ItemTitle>{title}</ItemTitle>
              <ItemDescription>{title === "Multiply" ? "Multiply two values" : "Number input"}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom out"
          disabled={zoom <= 0.25}
          onClick={() => setZoom(Math.max(0.25, zoom / 1.2))}
        >
          <MinusIcon />
        </Button>
        <Button variant="ghost" size="sm" aria-label="Reset zoom" onClick={() => setZoom(1)}>
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Zoom in"
          disabled={zoom >= 2}
          onClick={() => setZoom(Math.min(2, zoom * 1.2))}
        >
          <PlusIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Fit view" onClick={() => setZoom(1)}>
          <MaximizeIcon />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Item and Button reference only. Shadcn has no node graph, ports, edges, or minimap.
      </p>
    </div>
  )
}
