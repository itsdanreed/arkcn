import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"

export default function SheetExample() {
  return (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button variant="outline">Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Edit profile</Sheet.Title>
          <Sheet.Description>Make changes to your profile here.</Sheet.Description>
        </Sheet.Header>
        <Sheet.Footer>
          <Sheet.CloseTrigger asChild>
            <Button>Save</Button>
          </Sheet.CloseTrigger>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  )
}
