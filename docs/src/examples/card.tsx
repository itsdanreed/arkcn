import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CardExample() {
  return (
    <Card.Root className="w-80">
      <Card.Header>
        <Card.Title>Create project</Card.Title>
        <Card.Description>Deploy your new project in one click.</Card.Description>
      </Card.Header>
      <Card.Content className="text-sm text-muted-foreground">
        Cards compose a header, content, and footer.
      </Card.Content>
      <Card.Footer className="justify-end gap-2">
        <Button variant="outline" onClick={() => toast("Demo project cancelled")}>
          Cancel
        </Button>
        <Button onClick={() => toast("Demo project deployed")}>Deploy</Button>
      </Card.Footer>
    </Card.Root>
  )
}
