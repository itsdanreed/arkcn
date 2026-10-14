import { Toggle } from "../adapters/toggle"
import { BoldIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-4">
      {(["default", "outline"] as const).flatMap((variant) =>
        (["sm", "default", "lg"] as const).map((size) => (
          <section key={`${variant}-${size}`} data-audit-case={`${variant}-${size}`} className="flex gap-4">
            <Toggle.Root variant={variant} size={size} aria-label="Normal">
              <BoldIcon />
            </Toggle.Root>
            <Toggle.Root variant={variant} size={size} defaultPressed aria-label="Pressed">
              <BoldIcon />
            </Toggle.Root>
            <Toggle.Root variant={variant} size={size} disabled aria-label="Disabled">
              <BoldIcon />
            </Toggle.Root>
            <Toggle.Root variant={variant} size={size} aria-invalid aria-label="Invalid">
              <BoldIcon />
            </Toggle.Root>
          </section>
        ))
      )}
    </div>
  )
}
