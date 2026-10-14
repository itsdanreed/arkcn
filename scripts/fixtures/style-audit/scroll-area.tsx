import { useState } from "react"
import { ScrollArea, ScrollBar } from "../adapters/scroll-area"
export default function Example() {
  const [wide, setWide] = useState(true)
  return (
    <div className="grid grid-cols-2 gap-6">
      {["short", "long", "wide", "both"].map((kind) => (
        <section data-audit-case={kind} key={kind}>
          <ScrollArea.Root className="h-48 w-56 rounded-md border">
            <div className={kind === "wide" || (kind === "both" && wide) ? "w-96 p-3" : "p-3"}>
              {Array.from({ length: kind === "short" || kind === "wide" ? 2 : 20 }, (_, i) => (
                <div key={i} className="border-b py-1.5 text-sm">
                  Row {i + 1}
                </div>
              ))}
            </div>
            {(kind === "wide" || kind === "both") && <ScrollBar orientation="horizontal" />}
          </ScrollArea.Root>
          {kind === "both" && <button onClick={() => setWide(!wide)}>Toggle horizontal overflow</button>}
        </section>
      ))}
    </div>
  )
}
