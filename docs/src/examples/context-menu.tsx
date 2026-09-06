import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export default function ContextMenuExample() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuGroup>
          <ContextMenuItem value="back">Back</ContextMenuItem>
          <ContextMenuItem value="forward">Forward</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem value="inspect">Inspect</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
