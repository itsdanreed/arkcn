import { parseDate } from "@ark-ui/react"
import { DateInput } from "@/components/ui/date-input"
export default function Example() {
  return (
    <div className="w-72 max-w-full space-y-5">
      {["default", "empty", "disabled", "invalid", "readonly"].map((state) => (
        <section key={state} data-audit-case={state}>
          <DateInput.Root
            locale="en-US"
            defaultValue={state === "empty" ? [] : [parseDate("2026-10-13")]}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <DateInput.Label>{state} date</DateInput.Label>
            <DateInput.Control className="w-full">
              <DateInput.SegmentGroup />
              <DateInput.HiddenInput />
            </DateInput.Control>
          </DateInput.Root>
        </section>
      ))}
    </div>
  )
}
