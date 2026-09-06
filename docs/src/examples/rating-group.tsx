import {
  RatingGroup,
  RatingGroupContext,
  RatingGroupControl,
  RatingGroupHiddenInput,
  RatingGroupItem,
  RatingGroupLabel,
} from "@/components/ui/rating-group"

// With no children, RatingGroup renders the control and stars for you; compose them to add a label.
export default function RatingGroupExample() {
  return (
    <RatingGroup count={5} defaultValue={3} allowHalf>
      <RatingGroupLabel>Rate this component</RatingGroupLabel>
      <RatingGroupControl>
        <RatingGroupContext>
          {({ items }) => items.map((index) => <RatingGroupItem key={index} index={index} />)}
        </RatingGroupContext>
        <RatingGroupHiddenInput />
      </RatingGroupControl>
    </RatingGroup>
  )
}
