import { useState, type CSSProperties } from "react"
import { LocaleProvider } from "@ark-ui/react"
import { ContextMenu as Menu } from "@/components/ui/context-menu"
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
          <LocaleProvider locale={dir === "rtl" ? "ar" : "en-US"}>
            <Menu.Root>
              <Menu.ContextTrigger
                style={style}
                className="flex h-24 w-64 items-center justify-center rounded-md border border-dashed text-sm"
              >
                Open {name} menu
              </Menu.ContextTrigger>
              <Menu.Content className="w-56">
                {name === "tall" &&
                  Array.from({ length: 24 }, (_, i) => (
                    <Menu.Item key={i} value={`extra-${i}`}>
                      Extra item {i + 1}
                    </Menu.Item>
                  ))}
                <Menu.Item value="normal">
                  Normal <Menu.Shortcut>⌘N</Menu.Shortcut>
                </Menu.Item>
                <Menu.Item value="disabled" disabled>
                  Disabled
                </Menu.Item>
                <Menu.Item value="delete" variant="destructive">
                  <TrashIcon />
                  Delete
                </Menu.Item>
                <Menu.Separator />
                <Menu.CheckboxItem checked>Checked</Menu.CheckboxItem>
                <Menu.RadioItemGroup value="one">
                  <Menu.RadioItem value="one">One</Menu.RadioItem>
                  <Menu.RadioItem value="two">Two</Menu.RadioItem>
                </Menu.RadioItemGroup>
                <Menu.Sub>
                  <Menu.TriggerItem>More</Menu.TriggerItem>
                  <Menu.SubContent>
                    <Menu.Item value="nested">Nested action</Menu.Item>
                    <Menu.Item value="nested-disabled" disabled>
                      Unavailable
                    </Menu.Item>
                  </Menu.SubContent>
                </Menu.Sub>
              </Menu.Content>
            </Menu.Root>
          </LocaleProvider>
        </section>
      ))}
      <output data-cursor-point={point} />
    </div>
  )
}
