import { LocaleProvider } from "@ark-ui/react"
import { Menubar as Menu } from "@/components/ui/menubar"
import { TrashIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-12">
      {(["ltr", "rtl"] as const).map((dir) => (
        <section key={dir} dir={dir} data-audit-case={dir}>
          <LocaleProvider locale={dir === "rtl" ? "ar" : "en-US"}>
            <Menu.Root>
              <Menu.Menu value="file">
                <Menu.Trigger>Open {dir} menu</Menu.Trigger>
                <Menu.Content className="w-56">
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
              </Menu.Menu>
            </Menu.Root>
          </LocaleProvider>
        </section>
      ))}
    </div>
  )
}
