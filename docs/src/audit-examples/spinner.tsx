import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [shown, setShown] = useState(false)
  const { trace } = useAuditMotion('[data-slot="spinner"]', 1200)
  return (
    <section data-audit-case="loading">
      <button onClick={() => setShown(!shown)}>Toggle loading preview</button>
      {shown && (
        <div className="mt-6 flex items-center gap-6">
          <Spinner.Root />
          <Spinner.Root className="size-8 text-muted-foreground" />
          <Button disabled>
            <Spinner.Root />
            Saving
          </Button>
        </div>
      )}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </section>
  )
}
