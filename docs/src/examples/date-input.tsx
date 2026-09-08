import { DateInput } from "@/components/ui/date-input"

export default function DateInputExample() {
  return (
    <DateInput.Root className="w-64">
      <DateInput.Label>Start date</DateInput.Label>
      <DateInput.Control>
        <DateInput.SegmentGroup />
        <DateInput.HiddenInput />
      </DateInput.Control>
    </DateInput.Root>
  )
}
