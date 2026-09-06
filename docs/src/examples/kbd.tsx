import { Kbd, KbdGroup } from "@/components/ui/kbd"

export default function KbdExample() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <span className="text-muted-foreground">to search</span>
    </div>
  )
}
