import { Avatar } from "@multicomma/arkcn-react-native/ui/avatar"
import { Message } from "@multicomma/arkcn-react-native/ui/message"

export default function MessageExample() {
  return (
    <Message.Group style={{ width: 384, maxWidth: "100%" }}>
      <Message.Root>
        <Message.Avatar>
          <Avatar.Root>
            <Avatar.Fallback>AC</Avatar.Fallback>
          </Avatar.Root>
        </Message.Avatar>
        <Message.Content>
          <Message.Header>Ava Chen</Message.Header>Can you take a look at the new docs?
          <Message.Footer>9:12 AM</Message.Footer>
        </Message.Content>
      </Message.Root>
      <Message.Root align="end">
        <Message.Content>
          <Message.Header>You</Message.Header>On it.<Message.Footer>9:15 AM</Message.Footer>
        </Message.Content>
      </Message.Root>
    </Message.Group>
  )
}
