import { BoldIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

export default function ToggleExample() {
  return (
    <Toggle aria-label="Toggle bold">
      <BoldIcon /> Bold
    </Toggle>
  )
}
