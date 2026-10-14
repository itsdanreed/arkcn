import { useState } from "react"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
function ExampleControl({ state }: { state: string }) {
  const [value, setValue] = useState([45])
  return (
    <section data-audit-case={state} className="inline-flex flex-col items-center gap-2">
      <Label id={`angle-${state}`}>{state}</Label>
      <div className="flex size-24 items-center">
        <Slider
          aria-labelledby={`angle-${state}`}
          value={value}
          min={0}
          max={360}
          disabled={state === "disabled"}
          onValueChange={(v) => {
            if (state !== "readonly") setValue(Array.isArray(v) ? v : [v])
          }}
        />
      </div>
      <span className="text-sm text-muted-foreground tabular-nums">{value[0]}°</span>
    </section>
  )
}
export default function Example() {
  return (
    <div className="flex flex-wrap gap-8">
      {["default", "disabled", "readonly"].map((state) => (
        <ExampleControl key={state} state={state} />
      ))}
    </div>
  )
}
