import { Bubble } from "@/components/ui/bubble"

export default function BubbleExample() {
  return (
    <Bubble.Group className="w-80">
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
