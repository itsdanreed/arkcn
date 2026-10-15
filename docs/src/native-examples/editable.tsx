import { Editable } from "@multicomma/arkcn-react-native/ui/editable"

export default function EditableExample() {
  return (
    <Editable.Root defaultValue="Click to edit this title" style={{ width: 320, maxWidth: "100%" }}>
      <Editable.Label>Title</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  )
}
