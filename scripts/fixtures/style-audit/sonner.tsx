import { useState } from "react"
import { toast } from "sonner"
import { Toaster } from "../ui/sonner"
import { Button } from "../adapters/button"
import { useAuditMotion } from "../../src/audit-motion"

export default function Example() {
  const [expanded, setExpanded] = useState(false)
  const { trace } = useAuditMotion("[data-sonner-toast]", 500)
  return (
    <section data-audit-case="sonner">
      <div className="flex flex-wrap gap-2">
        {(["success", "info", "warning", "error", "loading"] as const).map((type) => (
          <Button
            variant="outline"
            key={type}
            onClick={() =>
              toast[type](type + " notification", {
                id: type,
                description: "Your workspace has been updated.",
                duration: Infinity,
              })
            }
          >
            {type}
          </Button>
        ))}
        <Button
          onClick={() =>
            toast("Action required", {
              id: "action",
              duration: Infinity,
              description: "Review the pending changes.",
              action: { label: "Review", onClick: () => {} },
              cancel: { label: "Later", onClick: () => {} },
            })
          }
        >
          Action
        </Button>
        <Button variant="outline" onClick={() => setExpanded(!expanded)}>
          Toggle stack expansion
        </Button>
        <Button variant="outline" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
      <Toaster
        theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
        expand={expanded}
        visibleToasts={6}
        closeButton
      />
      <output hidden data-motion-trace>
        {trace}
      </output>
    </section>
  )
}
