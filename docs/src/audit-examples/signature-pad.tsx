import { useState } from "react"
import { SignaturePad, useSignaturePad } from "@/components/ui/signature-pad"
import { Button } from "@/components/ui/button"

function ProviderCheck() {
  const [readOnly, setReadOnly] = useState(true)
  const value = useSignaturePad({ readOnly, defaultPaths: ["M 20 20 L 80 80 Z"] })
  return (
    <section aria-label="Provider behavior check" className="space-y-2">
      <SignaturePad.RootProvider value={value}>
        <SignaturePad.Label>Provider signature</SignaturePad.Label>
        <SignaturePad.Control />
      </SignaturePad.RootProvider>
      <p role="status">
        {value.paths.length} strokes; {readOnly ? "read-only" : "editable"}
      </p>
      <Button variant="outline" onClick={() => value.clear()}>
        Attempt API clear
      </Button>
      <Button variant="outline" onClick={() => setReadOnly(!readOnly)}>
        Toggle editing
      </Button>
    </section>
  )
}

export default function Example() {
  return (
    <div className="w-80 max-w-full space-y-5">
      {["default", "disabled", "readonly", "invalid"].map((state) => (
        <section key={state} data-audit-case={state}>
          <SignaturePad.Root
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
            defaultPaths={["M 24 56 L 96 80 L 160 32 L 162 36 L 98 84 L 24 60 Z"]}
          >
            <SignaturePad.Label>{state} signature</SignaturePad.Label>
            <SignaturePad.Control data-audit-part="surface" aria-invalid={state === "invalid" || undefined}>
              <SignaturePad.Segment />
              <SignaturePad.Guide />
              <SignaturePad.ClearTrigger aria-label={`Clear ${state}`} />
            </SignaturePad.Control>
          </SignaturePad.Root>
        </section>
      ))}
      <ProviderCheck />
    </div>
  )
}
