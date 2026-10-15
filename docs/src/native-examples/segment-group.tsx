import { View } from "react-native"
import { SegmentGroup } from "@multicomma/arkcn-react-native/ui/segment-group"

export default function SegmentGroupExample() {
  return (
    <View>
      <SegmentGroup.Root defaultValue="week" accessibilityLabel="Calendar view">
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="day">Day</SegmentGroup.Item>
        <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
        <SegmentGroup.Item value="month">Month</SegmentGroup.Item>
      </SegmentGroup.Root>
    </View>
  )
}
