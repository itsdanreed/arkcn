import { Clipboard } from "@/components/ui/clipboard"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "long"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Clipboard.Root
            value={state === "long" ? "https://example.com/a/long/path/to/a/shared/document" : "https://example.com"}
            timeout={10000}
          >
            <Clipboard.Label>{state} link</Clipboard.Label>
            <Clipboard.Control>
              <Clipboard.Input disabled={state === "disabled"} aria-invalid={state === "invalid" || undefined} />
              <Clipboard.Trigger disabled={state === "disabled"} aria-label="Copy link" />
            </Clipboard.Control>
          </Clipboard.Root>
        </section>
      ))}
    </div>
  )
}
