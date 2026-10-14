import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const { trace } = useAuditMotion(
    '[data-slot="sheet-content"],[data-slot="sheet-popup"],[data-slot="sheet-overlay"]',
    550
  )
  return (
    <div className="flex flex-wrap gap-3">
      {(["top", "right", "bottom", "left"] as const).map((variant) => (
        <Sheet.Root key={variant}>
          <Sheet.Trigger asChild>
            <Button variant="outline">Open {variant}</Button>
          </Sheet.Trigger>
          <Sheet.Content side={variant} data-audit-case={variant}>
            <Sheet.Header>
              <Sheet.Title>Edit profile</Sheet.Title>
              <Sheet.Description>
                Make changes to your profile here. Review your information before saving the changes.
              </Sheet.Description>
            </Sheet.Header>
            <Sheet.Footer>
              <Sheet.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Sheet.CloseTrigger>
              <Sheet.CloseTrigger asChild>
                <Button>Save changes</Button>
              </Sheet.CloseTrigger>
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet.Root>
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
