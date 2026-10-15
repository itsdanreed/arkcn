import { RatingGroup } from "@multicomma/arkcn-react-native/ui/rating-group"

export default function RatingGroupExample() {
  return (
    <RatingGroup.Root count={5} defaultValue={3} allowHalf>
      <RatingGroup.Label>Rate this component</RatingGroup.Label>
      <RatingGroup.Control>
        <RatingGroup.Context>
          {({ items }) => items.map((index) => <RatingGroup.Item key={index} index={index} />)}
        </RatingGroup.Context>
      </RatingGroup.Control>
    </RatingGroup.Root>
  )
}
