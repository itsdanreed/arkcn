import { toast } from "sonner"
import { FileTextIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

export default function ItemExample() {
  return (
    <Item variant="outline" className="w-96">
      <ItemMedia variant="icon">
        <FileTextIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Quarterly report.pdf</ItemTitle>
        <ItemDescription>2.4 MB · uploaded yesterday</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Download selected", { description: "Connect this action to your file URL." })}
        >
          Download
        </Button>
      </ItemActions>
    </Item>
  )
}
