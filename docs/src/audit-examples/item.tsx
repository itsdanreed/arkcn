import { Item } from "@/components/ui/item"
import { ChevronRightIcon, FileIcon } from "lucide-react"
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23888'/%3E%3C/svg%3E"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "sm", "xs"] as const).map((size) => (
        <section data-audit-case={size} key={size}>
          <Item.Group>
            {(["default", "outline", "muted"] as const).map((variant, index) => (
              <Item.Root key={variant} size={size} variant={variant} asChild>
                <a href="#item" onClick={(e) => e.preventDefault()}>
                  <Item.Media variant={index === 1 ? "image" : "icon"}>
                    {index === 1 ? <img src={image} alt="Document" /> : <FileIcon />}
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>Workspace document</Item.Title>
                    <Item.Description>
                      A detailed description that wraps across several lines when the available space is narrow.
                    </Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <ChevronRightIcon className="size-4" />
                  </Item.Actions>
                </a>
              </Item.Root>
            ))}
            <Item.Separator />
            <Item.Root size={size} variant="outline">
              <Item.Header>Header</Item.Header>
              <Item.Content>
                <Item.Title>Summary</Item.Title>
              </Item.Content>
              <Item.Content>12 items</Item.Content>
              <Item.Footer>Footer</Item.Footer>
            </Item.Root>
          </Item.Group>
        </section>
      ))}
    </div>
  )
}
