import { AlertDialog } from "../adapters/alert-dialog"
import { Button } from "../adapters/button"
import { useAuditMotion } from "../../src/audit-motion"
import { TrashIcon } from "lucide-react"
export default function Example() {
  const { trace } = useAuditMotion(
    '[data-slot="alert-dialog-content"],[data-slot="alert-dialog-popup"],[data-slot="alert-dialog-overlay"]',
    550
  )
  return (
    <div className="flex flex-wrap gap-3">
      {(["default", "sm", "media", "sm-media"] as const).map((variant) => (
        <AlertDialog.Root key={variant}>
          <AlertDialog.Trigger asChild>
            <Button variant="outline">Open {variant}</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content size={variant.startsWith("sm") ? "sm" : "default"} data-audit-case={variant}>
            <AlertDialog.Header>
              {variant.includes("media") && (
                <AlertDialog.Media>
                  <TrashIcon />
                </AlertDialog.Media>
              )}
              <AlertDialog.Title>Edit profile</AlertDialog.Title>
              <AlertDialog.Description>
                Make changes to your profile here. Review your information before saving the changes.
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.CloseTrigger>Continue</AlertDialog.CloseTrigger>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
