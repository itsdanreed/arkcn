import { RatingGroup, RatingGroupControl, RatingGroupLabel } from "@/components/ui/rating-group"

export default function RatingGroupExample() {
  return (
    <RatingGroup count={5} defaultValue={3} allowHalf>
      <RatingGroupLabel>Rate this component</RatingGroupLabel>
      <RatingGroupControl />
    </RatingGroup>
  )
}
