import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Canvas,
  CanvasArea,
  CanvasEmpty,
  CanvasNode,
  CanvasNodeActions,
  CanvasNodeHandle,
  CanvasNodeHeader,
  CanvasNodeTitle,
  CanvasPalette,
  CanvasPaletteItem,
  CanvasResizeHandle,
  CanvasRow,
} from "@/components/ui/canvas"
import { applyRowDrop, removeRowItem, resizeRowItems, type Row } from "@/lib/row-layout"

type Block = { id: string; width: number; kind: string }
let seq = 0
const uid = (p: string) => `${p}-${++seq}`

export default function CanvasExample() {
  const [rows, setRows] = React.useState<Row<Block>[]>([
    {
      id: "r1",
      items: [
        { id: "b1", width: 1, kind: "Heading" },
        { id: "b2", width: 1, kind: "Image" },
      ],
    },
    { id: "r2", items: [{ id: "b3", width: 1, kind: "Paragraph" }] },
  ])
  return (
    <Canvas
      onDrop={(details) =>
        setRows((prev) =>
          applyRowDrop(prev, details, {
            create: (data) => (typeof data === "string" ? { id: uid("b"), width: 1, kind: data } : null),
            rowId: () => uid("r"),
          })
        )
      }
      className="h-96 w-full"
    >
      <CanvasPalette>
        {["Heading", "Paragraph", "Image", "Button"].map((kind) => (
          <CanvasPaletteItem key={kind} data={kind}>
            {kind}
          </CanvasPaletteItem>
        ))}
      </CanvasPalette>
      <CanvasArea>
        {rows.length === 0 && <CanvasEmpty>Drop a block here</CanvasEmpty>}
        {rows.map((row, rowIndex) => (
          <CanvasRow key={row.id}>
            {row.items.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <CanvasResizeHandle
                    onResize={(delta) =>
                      setRows((prev) => prev.map((r, i) => (i === rowIndex ? resizeRowItems(r, index - 1, delta) : r)))
                    }
                  />
                )}
                <CanvasNode value={item.id} width={item.width} draggable>
                  <CanvasNodeHeader>
                    <CanvasNodeHandle />
                    <CanvasNodeTitle>{item.kind}</CanvasNodeTitle>
                    <CanvasNodeActions>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove"
                        onClick={() => setRows((prev) => removeRowItem(prev, item.id))}
                      >
                        <XIcon />
                      </Button>
                    </CanvasNodeActions>
                  </CanvasNodeHeader>
                  <div className="h-12 rounded-b-md bg-muted/40" />
                </CanvasNode>
              </React.Fragment>
            ))}
          </CanvasRow>
        ))}
      </CanvasArea>
    </Canvas>
  )
}
