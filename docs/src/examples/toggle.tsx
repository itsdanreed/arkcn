import { BoldIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
export default function ToggleExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Toggle.Root aria-label="Toggle bold">
        <BoldIcon /> Bold
      </Toggle.Root>
      <Toggle.Root variant="outline" defaultPressed aria-label="Toggle outline bold">
        <BoldIcon /> Bold
      </Toggle.Root>
      <Toggle.Root size="sm" disabled aria-label="Toggle disabled bold">
        <BoldIcon />
      </Toggle.Root>
      <Toggle.Root size="lg" variant="outline" aria-label="Toggle large bold">
        <BoldIcon />
      </Toggle.Root>
    </div>
  )
}
