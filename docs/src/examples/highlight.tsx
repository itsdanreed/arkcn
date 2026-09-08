import * as React from "react"
import { Highlight } from "@/components/ui/highlight"
import { Input } from "@/components/ui/input"
export default function HighlightExample() {
  const [query, setQuery] = React.useState("components")
  return (
    <div className="flex w-80 flex-col gap-4">
      <Input.Root aria-label="Highlight text" value={query} onChange={(event) => setQuery(event.target.value)} />
      <p className="text-sm">
        <Highlight.Root query={query} text="Compose accessible components with Ark UI components." />
      </p>
    </div>
  )
}
