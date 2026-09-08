import { AlertDialog } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export default function AlertDialogExample() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>
            This permanently deletes your account and removes your data from our servers.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.CloseTrigger>Continue</AlertDialog.CloseTrigger>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
