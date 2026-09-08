import { Editable } from "@/components/ui/editable"

export default function EditableExample() {
  return (
    <Editable.Root defaultValue="Click to edit this title" className="w-80">
      <Editable.Label>Title</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  )
}
