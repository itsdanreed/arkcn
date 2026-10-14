import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [shown, setShown] = useState(false)
  const { trace } = useAuditMotion('[data-slot="skeleton"]', 2200)
  return (
    <section data-audit-case="loading">
      <button onClick={() => setShown(!shown)}>Toggle loading preview</button>
      {shown && (
        <div className="mt-6 flex gap-4">
          <Skeleton.Root className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton.Root className="h-4 w-48" />
            <Skeleton.Root className="h-4 w-32" />
          </div>
        </div>
      )}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </section>
  )
}
