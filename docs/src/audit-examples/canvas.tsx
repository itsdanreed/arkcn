import { useAuditMotion } from "../audit-motion"
import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Canvas } from "@/components/ui/canvas"
import { applyRowDrop, removeRowItem, resizeRowItems, type Row } from "@/lib/row-layout"

type Block = { id: string; width: number; kind: string }
let seq = 0
const uid = (p: string) => `${p}-${++seq}`

export default function CanvasExample() {
  const { trace } = useAuditMotion(
    '[data-slot="canvas-palette-item"], [data-slot="canvas-node-handle"], [data-slot="canvas-node-actions"]'
  )
  const [previewEdge, setPreviewEdge] = React.useState<"" | "top" | "bottom" | "left" | "right">("")
  const [dropTrace, setDropTrace] = React.useState("")
  React.useEffect(() => {
    let frame = 0
    const samples: unknown[] = []
    const start = () => {
      samples.length = 0
    }
    const observe = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const area = document.querySelector('[data-slot="canvas-area"]')
        if (!area) return
        const bounds = area.getBoundingClientRect()
        for (const indicator of area.querySelectorAll('[data-slot="canvas-drop-indicator"]')) {
          const rect = indicator.getBoundingClientRect()
          samples.push({
            edge: indicator.getAttribute("data-edge"),
            node: indicator.closest('[data-slot="canvas-node"]')?.getAttribute("data-value"),
            inside:
              rect.left >= bounds.left + 1 &&
              rect.right <= bounds.right - 1 &&
              rect.top >= bounds.top + 1 &&
              rect.bottom <= bounds.bottom - 1,
            width: rect.width,
            height: rect.height,
            color: getComputedStyle(indicator).backgroundColor,
            marker: getComputedStyle(indicator, "::before").content,
          })
        }
      })
    }
    const finish = () => setDropTrace(JSON.stringify(samples))
    document.addEventListener("dragstart", start)
    document.addEventListener("dragover", observe)
    document.addEventListener("drop", finish)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("dragstart", start)
      document.removeEventListener("dragover", observe)
      document.removeEventListener("drop", finish)
    }
  }, [])
  const [rows, setRows] = React.useState<Row<Block>[]>([
    {
      id: "r1",
      items: [
        { id: "b1", width: 1, kind: "Heading" },
        { id: "b2", width: 1, kind: "Image" },
      ],
    },
  ])
  return (
    <div className="space-y-4">
      <output hidden data-audit-drop>
        {dropTrace}
      </output>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setRows([
              {
                id: "r1",
                items: [
                  { id: "b1", width: 1, kind: "Heading" },
                  { id: "b2", width: 1, kind: "Image" },
                ],
              },
            ])
          }
        >
          Reset
        </Button>
        <Button variant="outline" onClick={() => setRows([])}>
          Clear
        </Button>
      </div>
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
                      aria-label="Resize columns"
                      onResize={(delta) =>
                        setRows((prev) =>
                          prev.map((r, i) => (i === rowIndex ? resizeRowItems(r, index - 1, delta) : r))
                        )
                      }
                    />
                  )}
                  <Canvas.Node value={item.id} width={item.width} draggable>
                    {previewEdge &&
                      rowIndex === 0 &&
                      (previewEdge === "right" ? index === row.items.length - 1 : index === 0) && (
                        <Canvas.DropIndicator edge={previewEdge} />
                      )}
                    <Canvas.NodeHeader>
                      <Canvas.NodeHandle aria-label={`Drag ${item.kind}`} />
                      <Canvas.NodeTitle>{item.kind}</Canvas.NodeTitle>
                      <Canvas.NodeActions>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Remove ${item.kind}`}
                          onClick={() => setRows((prev) => removeRowItem(prev, item.id))}
                        >
                          <XIcon />
                        </Button>
                      </Canvas.NodeActions>
                    </Canvas.NodeHeader>
                  </Canvas.Node>
                </React.Fragment>
              ))}
            </Canvas.Row>
          ))}
        </Canvas.Area>
      </Canvas.Root>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Drop indicator preview
        <select
          aria-label="Drop indicator preview"
          value={previewEdge}
          onChange={(event) => setPreviewEdge(event.target.value as typeof previewEdge)}
        >
          <option value="">None</option>
          <option value="left">Before first column</option>
          <option value="right">After last column</option>
          <option value="top">Above first row</option>
          <option value="bottom">Below row</option>
        </select>
      </label>
    </div>
  )
}
