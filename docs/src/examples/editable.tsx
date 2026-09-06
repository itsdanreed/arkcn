import { Editable, EditableArea, EditableInput, EditableLabel, EditablePreview } from "@/components/ui/editable"

export default function EditableExample() {
  return (
    <Editable defaultValue="Click to edit this title" className="w-80">
      <EditableLabel>Title</EditableLabel>
      <EditableArea>
        <EditableInput />
        <EditablePreview />
      </EditableArea>
    </Editable>
  )
}
