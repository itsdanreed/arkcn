import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"

export default function DrawerExample() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button variant="outline">Open drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Move goal</Drawer.Title>
          <Drawer.Description>Set your daily activity goal.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Footer>
          <Drawer.CloseTrigger asChild>
            <Button>Submit</Button>
          </Drawer.CloseTrigger>
          <Drawer.CloseTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </Drawer.CloseTrigger>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  )
}
