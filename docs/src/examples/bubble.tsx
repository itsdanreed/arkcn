import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"

export default function BubbleExample() {
  return (
    <BubbleGroup className="w-80">
      <Bubble align="start">
        <BubbleContent>Hey! Did the deploy go through?</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="secondary">
        <BubbleContent>Yes, all green.</BubbleContent>
        <BubbleReactions>👍 2</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  )
}
