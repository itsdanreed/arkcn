import { useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
function Case({ state }: { state: string }) {
  const [copied, setCopied] = useState(false)
  const value = state === "long" ? "https://example.com/a/long/path/to/a/shared/document" : "https://example.com"
  return (
    <section data-audit-case={state} className="flex flex-col gap-1.5">
      <Label htmlFor={state}>{state} link</Label>
      <div className="flex items-center gap-1">
        <Input
          id={state}
          readOnly
          value={value}
          disabled={state === "disabled"}
          aria-invalid={state === "invalid" || undefined}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Copy link"
          disabled={state === "disabled"}
          onClick={async () => {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 10000)
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </section>
  )
}
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "long"].map((state) => (
        <Case key={state} state={state} />
      ))}
    </div>
  )
}
