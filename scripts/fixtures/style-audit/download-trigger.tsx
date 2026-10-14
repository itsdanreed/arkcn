import { DownloadIcon } from "lucide-react"
import { Button } from "../ui/button"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "custom"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Button
            variant={state === "custom" ? "secondary" : "outline"}
            size={state === "custom" ? "sm" : "default"}
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
          >
            <DownloadIcon data-icon="inline-start" />
            Download {state}
          </Button>
        </section>
      ))}
    </div>
  )
}
