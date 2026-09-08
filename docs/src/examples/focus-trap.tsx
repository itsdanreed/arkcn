import * as React from "react"
import { FocusTrap } from "@/components/ui/focus-trap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
export default function FocusTrapExample() {
  const [active, setActive] = React.useState(false)
  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setActive(true)}>Activate focus trap</Button>
      <FocusTrap.Root disabled={!active} className="flex flex-col gap-3 rounded-lg border p-4">
        <Input.Root aria-label="First field" placeholder="First field" />
        <Input.Root aria-label="Second field" placeholder="Second field" />
        <Button variant="outline" onClick={() => setActive(false)}>
          Release focus
        </Button>
      </FocusTrap.Root>
    </div>
  )
}
