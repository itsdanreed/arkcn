import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-4">
      {(["default", "outline", "secondary", "ghost", "destructive", "link"] as const).map((variant) => (
        <section key={variant} data-audit-case={variant} className="flex items-center gap-4">
          <Button variant={variant}>Normal</Button>
          <Button variant={variant} aria-expanded>
            Expanded
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} aria-invalid>
            Invalid
          </Button>
        </section>
      ))}
      {(["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"] as const).map((size) => (
        <section key={size} data-audit-case={size} className="inline-flex pr-4">
          <Button size={size} variant="outline" aria-label={size}>
            <PlusIcon data-icon="inline-start" />
            {!size.startsWith("icon") && "Add"}
          </Button>
        </section>
      ))}
    </div>
  )
}
