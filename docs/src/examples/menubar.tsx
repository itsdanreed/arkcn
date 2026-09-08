import { Menubar } from "@/components/ui/menubar"

export default function MenubarExample() {
  return (
    <Menubar.Root>
      <Menubar.Menu value="file">
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.ItemGroup>
            <Menubar.Item value="new">
              New tab <Menubar.Shortcut>⌘T</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item value="open">Open…</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item value="print">Print</Menubar.Item>
          </Menubar.ItemGroup>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu value="edit">
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.ItemGroup>
            <Menubar.Item value="undo">Undo</Menubar.Item>
            <Menubar.Item value="redo">Redo</Menubar.Item>
          </Menubar.ItemGroup>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  )
}
