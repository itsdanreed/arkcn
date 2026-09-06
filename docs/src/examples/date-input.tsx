import {
  DateInput,
  DateInputControl,
  DateInputHiddenInput,
  DateInputLabel,
  DateInputSegmentGroup,
} from "@/components/ui/date-input"

export default function DateInputExample() {
  return (
    <DateInput className="w-64">
      <DateInputLabel>Start date</DateInputLabel>
      <DateInputControl>
        <DateInputSegmentGroup />
        <DateInputHiddenInput />
      </DateInputControl>
    </DateInput>
  )
}
