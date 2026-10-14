import { Kbd } from "@/components/ui/kbd"
import { CommandIcon, ArrowUpIcon } from "lucide-react"
function Keys() {
  return (
    <Kbd.Group>
      <Kbd.Root>
        <CommandIcon />
      </Kbd.Root>
      <Kbd.Root>
        <ArrowUpIcon />
      </Kbd.Root>
      <Kbd.Root>K</Kbd.Root>
      <Kbd.Root>Enter</Kbd.Root>
    </Kbd.Group>
  )
}
export default function Example() {
  return (
    <div className="space-y-6">
      <section data-audit-case="plain">
        <Keys />
      </section>
      <section data-audit-case="tooltip">
        <div data-slot="tooltip-content" className="w-fit rounded-md bg-foreground px-3 py-1.5 text-background">
          <Keys />
        </div>
      </section>
    </div>
  )
}
