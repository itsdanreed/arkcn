import { ContextMenu } from "@/components/ui/context-menu"

export default function ContextMenuExample() {
  return (
    <ContextMenu.Root>
      <ContextMenu.ContextTrigger className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenu.ContextTrigger>
      <ContextMenu.Content className="w-48">
        <ContextMenu.ItemGroup>
          <ContextMenu.Item value="back">Back</ContextMenu.Item>
          <ContextMenu.Item value="forward">Forward</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item value="inspect">Inspect</ContextMenu.Item>
        </ContextMenu.ItemGroup>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
