import { Badge } from "../adapters/badge"
import { CheckIcon, ArrowRightIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "secondary", "destructive", "outline", "ghost", "link"] as const).map((variant) => (
        <section key={variant} data-audit-case={variant} className="flex items-center gap-6">
          <Badge.Root variant={variant}>Label</Badge.Root>
          <Badge.Root variant={variant}>
            <CheckIcon data-icon="inline-start" />
            Verified
          </Badge.Root>
          <Badge.Root variant={variant} asChild>
            <a href="#badge" onClick={(e) => e.preventDefault()}>
              Details
              <ArrowRightIcon data-icon="inline-end" />
            </a>
          </Badge.Root>
          <Badge.Root variant={variant} aria-invalid="true" asChild>
            <a href="#badge" onClick={(e) => e.preventDefault()}>
              Invalid
            </a>
          </Badge.Root>
        </section>
      ))}
    </div>
  )
}
