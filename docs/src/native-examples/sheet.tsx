import { Sheet } from "@multicomma/arkcn-react-native/ui/sheet"
export default function SheetExample({
  safeAreaInsets,
}: { safeAreaInsets?: { top: number; bottom: number; left: number; right: number } } = {}) {
  return (
    <Sheet.Root safeAreaInsets={safeAreaInsets}>
      <Sheet.Trigger>Open sheet</Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Edit profile</Sheet.Title>
          <Sheet.Description>Make changes to your profile here.</Sheet.Description>
        </Sheet.Header>
        <Sheet.Footer>
          <Sheet.CloseTrigger>Save</Sheet.CloseTrigger>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  )
}
