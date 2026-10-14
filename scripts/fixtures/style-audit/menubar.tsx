import {
  Menubar,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarContent,
  MenubarTrigger,
  MenubarMenu,
} from "../ui/menubar"
import { DirectionProvider } from "../ui/direction"
import { TrashIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-12">
      {(["ltr", "rtl"] as const).map((dir) => (
        <section key={dir} dir={dir} data-audit-case={dir}>
          <DirectionProvider direction={dir}>
            <Menubar>
              <MenubarMenu value="file">
                <MenubarTrigger>Open {dir} menu</MenubarTrigger>
                <MenubarContent dir={dir} className="w-56">
                  <MenubarItem value="normal">
                    Normal <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem value="disabled" disabled>
                    Disabled
                  </MenubarItem>
                  <MenubarItem value="delete" variant="destructive">
                    <TrashIcon />
                    Delete
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarCheckboxItem checked>Checked</MenubarCheckboxItem>
                  <MenubarRadioGroup value="one">
                    <MenubarRadioItem value="one">One</MenubarRadioItem>
                    <MenubarRadioItem value="two">Two</MenubarRadioItem>
                  </MenubarRadioGroup>
                  <MenubarSub>
                    <MenubarSubTrigger>More</MenubarSubTrigger>
                    <MenubarSubContent dir={dir}>
                      <MenubarItem value="nested">Nested action</MenubarItem>
                      <MenubarItem value="nested-disabled" disabled>
                        Unavailable
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </DirectionProvider>
        </section>
      ))}
    </div>
  )
}
