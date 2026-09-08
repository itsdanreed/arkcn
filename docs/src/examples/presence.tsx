import * as React from "react"
import { Presence } from "@/components/ui/presence"
import { Button } from "@/components/ui/button"
export default function PresenceExample() {
  const [present, setPresent] = React.useState(true)
  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setPresent(!present)}>Toggle content</Button>
      <Presence.Root
        present={present}
        unmountOnExit
        className="rounded-lg border p-4 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      >
        Content is present.
      </Presence.Root>
    </div>
  )
}
