import { useState } from "react"
import { SegmentGroup, useSegmentGroup } from "@/components/ui/segment-group"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [long, setLong] = useState(false)
  const provider = useSegmentGroup({ defaultValue: "Second" })

  const motion = useAuditMotion('[data-slot="segment-group-indicator"]', 300)
  return (
    <div className="space-y-5">
      {["horizontal", "vertical", "rtl", "scaled"].map((state) => (
        <section key={state} data-audit-case={state} dir={state === "rtl" ? "rtl" : "ltr"}>
          <p className="mb-2 text-sm">{state}</p>
          <SegmentGroup.Root
            className={state === "scaled" ? "origin-top-left scale-110" : undefined}
            defaultValue="First"
            orientation={state === "vertical" ? "vertical" : "horizontal"}
            dir={state === "rtl" ? "rtl" : "ltr"}
            aria-label={state}
          >
            <SegmentGroup.Indicator />
            {["First", "Second", "Disabled"].map((name) => (
              <SegmentGroup.Item key={name} value={name} disabled={name === "Disabled"}>
                {name}
              </SegmentGroup.Item>
            ))}
          </SegmentGroup.Root>
        </section>
      ))}
      <section data-audit-case="provider">
        <p className="mb-2 text-sm">provider + resizing</p>
        <SegmentGroup.RootProvider value={provider}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="First">{long ? "A much longer first choice" : "First"}</SegmentGroup.Item>
          <SegmentGroup.Item value="Second">Second</SegmentGroup.Item>
        </SegmentGroup.RootProvider>
        <button className="ml-3 text-sm underline" onClick={() => setLong(!long)}>
          Resize label
        </button>
      </section>
      <output data-motion-trace hidden>
        {motion.trace}
      </output>
    </div>
  )
}
