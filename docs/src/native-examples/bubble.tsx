import { Bubble } from "@multicomma/arkcn-react-native/ui/bubble"

export default function BubbleExample() {
  return (
    <Bubble.Group style={{ width: 320, maxWidth: "100%" }}>
      <Bubble.Root align="start">
        <Bubble.Content>Hey! Did the deploy go through?</Bubble.Content>
      </Bubble.Root>
      <Bubble.Root align="end" variant="secondary">
        <Bubble.Content>Yes, all green.</Bubble.Content>
        <Bubble.Reactions>👍 2</Bubble.Reactions>
      </Bubble.Root>
    </Bubble.Group>
  )
}
