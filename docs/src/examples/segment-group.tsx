import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"

export default function SegmentGroupExample() {
  return (
    <SegmentGroup defaultValue="week">
      <SegmentGroupIndicator />
      <SegmentGroupItem value="day">Day</SegmentGroupItem>
      <SegmentGroupItem value="week">Week</SegmentGroupItem>
      <SegmentGroupItem value="month">Month</SegmentGroupItem>
    </SegmentGroup>
  )
}
