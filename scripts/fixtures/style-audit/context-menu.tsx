import { useState, type CSSProperties } from "react"
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuContent,
  ContextMenuTrigger,
} from "../ui/context-menu"
import { DirectionProvider } from "../ui/direction"
import { TrashIcon } from "lucide-react"
export default function Example() {
  const [point, setPoint] = useState("")
  const cases: { name: string; dir: "ltr" | "rtl"; style?: CSSProperties }[] = [
    { name: "ltr", dir: "ltr" },
    { name: "rtl", dir: "rtl" },
    { name: "tall", dir: "ltr" },
    {
      name: "top left",
      dir: "ltr",
      style: { position: "fixed", top: 0, left: 0, width: 8, height: 8, overflow: "hidden" },
    },
    {
      name: "top right",
      dir: "ltr",
      style: { position: "fixed", top: 0, right: 0, width: 8, height: 8, overflow: "hidden" },
    },
    {
      name: "bottom left",
      dir: "ltr",
      style: { position: "fixed", bottom: 0, left: 0, width: 8, height: 8, overflow: "hidden" },
    },
    {
      name: "bottom right",
      dir: "ltr",
      style: { position: "fixed", bottom: 0, right: 0, width: 8, height: 8, overflow: "hidden" },
    },
  ]
  return (
    <div className="space-y-12">
      {cases.map(({ name, dir, style }) => (
        <section
          key={name}
          dir={dir}
          data-audit-case={name}
          onContextMenuCapture={(e) => setPoint(JSON.stringify({ name, x: e.clientX, y: e.clientY }))}
        >
          <DirectionProvider direction={dir}>
            <ContextMenu>
              <ContextMenuTrigger
                style={style}
                className="flex h-24 w-64 items-center justify-center rounded-md border border-dashed text-sm"
              >
                Open {name} menu
              </ContextMenuTrigger>
              <ContextMenuContent dir={dir} className="w-56">
                {name === "tall" &&
                  Array.from({ length: 24 }, (_, i) => (
                    <ContextMenuItem key={i} value={`extra-${i}`}>
                      Extra item {i + 1}
                    </ContextMenuItem>
                  ))}
                <ContextMenuItem value="normal">
                  Normal <ContextMenuShortcut>⌘N</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem value="disabled" disabled>
                  Disabled
                </ContextMenuItem>
                <ContextMenuItem value="delete" variant="destructive">
                  <TrashIcon />
                  Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked>Checked</ContextMenuCheckboxItem>
                <ContextMenuRadioGroup value="one">
                  <ContextMenuRadioItem value="one">One</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="two">Two</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
                  <ContextMenuSubContent dir={dir}>
                    <ContextMenuItem value="nested">Nested action</ContextMenuItem>
                    <ContextMenuItem value="nested-disabled" disabled>
                      Unavailable
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </ContextMenuContent>
            </ContextMenu>
          </DirectionProvider>
        </section>
      ))}
      <output data-cursor-point={point} />
    </div>
  )
}
