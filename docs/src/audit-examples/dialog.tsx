import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const { trace } = useAuditMotion(
    '[data-slot="dialog-content"],[data-slot="dialog-popup"],[data-slot="dialog-overlay"]',
    550
  )
  return (
    <div className="flex flex-wrap gap-3">
      {(["default", "no-close"] as const).map((variant) => (
        <Dialog.Root key={variant}>
          <Dialog.Trigger asChild>
            <Button variant="outline">Open {variant}</Button>
          </Dialog.Trigger>
          <Dialog.Content showCloseButton={variant !== "no-close"} data-audit-case={variant}>
            <Dialog.Header>
              <Dialog.Title>Edit profile</Dialog.Title>
              <Dialog.Description>
                Make changes to your profile here. Review your information before saving the changes.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger asChild>
                <Button>Save changes</Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
