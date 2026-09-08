import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Make changes to your profile here. Click save when you are done.</Dialog.Description>
        </Dialog.Header>
        <div className="grid gap-3">
          <Label.Root htmlFor="dialog-name">Name</Label.Root>
          <Input.Root id="dialog-name" defaultValue="Alex Morgan" />
        </div>
        <Dialog.Footer>
          <Dialog.CloseTrigger asChild>
            <Button>Save changes</Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
