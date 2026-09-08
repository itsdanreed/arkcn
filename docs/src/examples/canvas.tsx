import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Canvas } from "@/components/ui/canvas"
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
    <Canvas.Root
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
      <Canvas.Palette>
        {["Heading", "Paragraph", "Image", "Button"].map((kind) => (
          <Canvas.PaletteItem key={kind} data={kind}>
            {kind}
          </Canvas.PaletteItem>
        ))}
      </Canvas.Palette>
      <Canvas.Area>
        {rows.length === 0 && <Canvas.Empty>Drop a block here</Canvas.Empty>}
        {rows.map((row, rowIndex) => (
          <Canvas.Row key={row.id}>
            {row.items.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <Canvas.ResizeHandle
                    onResize={(delta) =>
                      setRows((prev) => prev.map((r, i) => (i === rowIndex ? resizeRowItems(r, index - 1, delta) : r)))
                    }
                  />
                )}
                <Canvas.Node value={item.id} width={item.width} draggable>
                  <Canvas.NodeHeader>
                    <Canvas.NodeHandle />
                    <Canvas.NodeTitle>{item.kind}</Canvas.NodeTitle>
                    <Canvas.NodeActions>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Remove"
                        onClick={() => setRows((prev) => removeRowItem(prev, item.id))}
                      >
                        <XIcon />
                      </Button>
                    </Canvas.NodeActions>
                  </Canvas.NodeHeader>
                  <div className="h-12 rounded-b-md bg-muted/40" />
                </Canvas.Node>
              </React.Fragment>
            ))}
          </Canvas.Row>
        ))}
      </Canvas.Area>
    </Canvas.Root>
  )
}
