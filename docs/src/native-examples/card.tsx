import { Card } from "@multicomma/arkcn-react-native/ui/card"
import { Button } from "@multicomma/arkcn-react-native/ui/button"

export default function CardExample() {
  return (
    <Card.Root style={{ width: "100%", maxWidth: 320 }}>
      <Card.Header>
        <Card.Title>Create project</Card.Title>
        <Card.Description>Deploy your new project in one click.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Card.Description>Cards compose a header, content, and footer.</Card.Description>
      </Card.Content>
      <Card.Footer style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </Card.Footer>
    </Card.Root>
  )
}
