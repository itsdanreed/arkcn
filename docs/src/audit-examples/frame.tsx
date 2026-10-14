import { useAuditMotion } from "../audit-motion"
import { useMemo, useRef, useState } from "react"
import { Frame } from "@/components/ui/frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Contents() {
  const [count, setCount] = useState(0)
  return (
    <div className="grid gap-3">
      <Label.Root htmlFor="frame-name">Name</Label.Root>
      <Input.Root id="frame-name" placeholder="Inside the frame" />
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <output aria-live="polite">Count: {count}</output>
      </div>
    </div>
  )
}
export default function Example() {
  const { trace } = useAuditMotion('iframe[title="Isolated controls"]', 380)
  const [generation, setGeneration] = useState(0)
  const frame = useRef<HTMLIFrameElement>(null)
  // Explicitly supply this isolated current fixture's stylesheet. Frame itself must not copy parent CSS.
  const head = useMemo(
    () =>
      [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((node, index) =>
        node.tagName === "STYLE" ? (
          <style key={index}>{node.textContent}</style>
        ) : (
          <link key={index} rel="stylesheet" href={(node as HTMLLinkElement).href} />
        )
      ),
    []
  )
  return (
    <div className="w-full max-w-sm space-y-4">
      <output data-audit-motion hidden>
        {trace}
      </output>
      <Button variant="outline" size="sm" onClick={() => setGeneration(generation + 1)}>
        Reload frame
      </Button>
      <Frame.Root
        key={generation}
        ref={frame}
        title="Isolated controls"
        height={240}
        head={head}
        onMount={() => {
          const root = frame.current?.contentDocument?.documentElement
          if (root) {
            root.className = document.documentElement.className
            root.dataset.reducedMotion = document.documentElement.dataset.reducedMotion
          }
        }}
      >
        <div className="min-h-screen bg-background p-8 text-foreground">
          <Contents />
        </div>
      </Frame.Root>
    </div>
  )
}
