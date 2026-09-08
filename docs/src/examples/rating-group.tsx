import { RatingGroup } from "@/components/ui/rating-group"

// With no children, RatingGroup renders the control and stars for you; compose them to add a label.
export default function RatingGroupExample() {
  return (
    <RatingGroup.Root count={5} defaultValue={3} allowHalf>
      <RatingGroup.Label>Rate this component</RatingGroup.Label>
      <RatingGroup.Control>
        <RatingGroup.Context>
          {({ items }) => items.map((index) => <RatingGroup.Item key={index} index={index} />)}
        </RatingGroup.Context>
        <RatingGroup.HiddenInput />
      </RatingGroup.Control>
    </RatingGroup.Root>
  )
}
