import { AlertDialog } from "@multicomma/arkcn-react-native/ui/alert-dialog"
export default function AlertDialogExample() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger variant="destructive">Delete account</AlertDialog.Trigger>
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
