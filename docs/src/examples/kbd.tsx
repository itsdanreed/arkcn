import { Kbd } from "@/components/ui/kbd"

export default function KbdExample() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <Kbd.Group>
        <Kbd.Root>⌘</Kbd.Root>
        <Kbd.Root>K</Kbd.Root>
      </Kbd.Group>
      <span className="text-muted-foreground">to search</span>
    </div>
  )
}
