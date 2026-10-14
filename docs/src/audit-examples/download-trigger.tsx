import { DownloadIcon } from "lucide-react"
import { DownloadTrigger } from "@/components/ui/download-trigger"
import { Button } from "@/components/ui/button"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "custom"].map((state) => (
        <section key={state} data-audit-case={state}>
          <DownloadTrigger.Root
            data="Audit download\n"
            fileName="arkcn-audit-download.txt"
            mimeType="text/plain"
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
            asChild={state === "custom"}
          >
            {state === "custom" ? (
              <Button variant="secondary" size="sm">
                <DownloadIcon data-icon="inline-start" />
                Download {state}
              </Button>
            ) : (
              <>
                <DownloadIcon data-icon="inline-start" />
                Download {state}
              </>
            )}
          </DownloadTrigger.Root>
        </section>
      ))}
    </div>
  )
}
