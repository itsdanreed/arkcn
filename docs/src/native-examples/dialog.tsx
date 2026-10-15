import { View } from "react-native"
import { Dialog } from "@multicomma/arkcn-react-native/ui/dialog"
import { Input } from "@multicomma/arkcn-react-native/ui/input"
import { Label } from "@multicomma/arkcn-react-native/ui/label"

export default function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Edit profile</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Make changes to your profile here. Click save when you are done.</Dialog.Description>
        </Dialog.Header>
        <View style={{ gap: 12 }}>
          <Label.Root>Name</Label.Root>
          <Input.Root accessibilityLabel="Name" defaultValue="Alex Morgan" />
        </View>
        <Dialog.Footer>
          <Dialog.CloseTrigger>Save changes</Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
