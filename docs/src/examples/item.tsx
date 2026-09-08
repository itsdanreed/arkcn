import { toast } from "sonner"
import { FileTextIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"

export default function ItemExample() {
  return (
    <Item.Root variant="outline" className="w-96">
      <Item.Media variant="icon">
        <FileTextIcon />
      </Item.Media>
      <Item.Content>
        <Item.Title>Quarterly report.pdf</Item.Title>
        <Item.Description>2.4 MB · uploaded yesterday</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Download selected", { description: "Connect this action to your file URL." })}
        >
          Download
        </Button>
      </Item.Actions>
    </Item.Root>
  )
}
