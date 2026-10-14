import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { DirectionProvider } from "../ui/direction"
import { TrashIcon } from "lucide-react"
import { Button } from "../ui/button"
export default function Example() {
  return (
    <div className="space-y-12">
      {(["ltr", "rtl"] as const).map((dir) => (
        <section key={dir} dir={dir} data-audit-case={dir}>
          <DirectionProvider direction={dir}>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>Open {dir} menu</DropdownMenuTrigger>
              <DropdownMenuContent dir={dir} className="w-56">
                <DropdownMenuItem value="normal">
                  Normal <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem value="disabled" disabled>
                  Disabled
                </DropdownMenuItem>
                <DropdownMenuItem value="delete" variant="destructive">
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup value="one">
                  <DropdownMenuRadioItem value="one">One</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="two">Two</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent dir={dir}>
                    <DropdownMenuItem value="nested">Nested action</DropdownMenuItem>
                    <DropdownMenuItem value="nested-disabled" disabled>
                      Unavailable
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </DirectionProvider>
        </section>
      ))}
    </div>
  )
}
