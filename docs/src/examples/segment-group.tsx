import { SegmentGroup } from "@/components/ui/segment-group"

export default function SegmentGroupExample() {
  return (
    <SegmentGroup.Root defaultValue="week">
      <SegmentGroup.Indicator />
      <SegmentGroup.Item value="day">Day</SegmentGroup.Item>
      <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
      <SegmentGroup.Item value="month">Month</SegmentGroup.Item>
    </SegmentGroup.Root>
  )
}
