import { useState } from "react"
import { CalendarIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "../ui/table"
import { useAuditMotion } from "../../src/audit-motion"

export default function Example() {
  const [zoom, setZoom] = useState(24)
  const [empty, setEmpty] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const { trace } = useAuditMotion('[data-slot="table-row"], [data-slot="button"]')
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" aria-pressed={readOnly} onClick={() => setReadOnly(!readOnly)}>
          Read only
        </Button>
        <Button variant="outline" aria-pressed={empty} onClick={() => setEmpty(!empty)}>
          Empty
        </Button>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={zoom <= 8}
            onClick={() => setZoom(Math.max(8, zoom / 1.5))}
          >
            <MinusIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={zoom >= 160}
            onClick={() => setZoom(Math.min(160, zoom * 1.5))}
          >
            <PlusIcon />
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon />
            Today
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empty ? (
              <TableRow>
                <TableCell colSpan={2}>No tasks</TableCell>
              </TableRow>
            ) : (
              [
                ["Research", "100%"],
                ["Design", "60%"],
                ["Build", "10%"],
                ["Launch", "Milestone"],
              ].map(([title, progress]) => (
                <TableRow key={title}>
                  <TableCell>{title}</TableCell>
                  <TableCell>{progress}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Control reference: Button and Table. Shadcn has no Gantt timeline; bar layout and date interactions are Ark
        extensions.
      </p>
      <output hidden data-audit-motion>
        {trace}
      </output>
    </div>
  )
}
