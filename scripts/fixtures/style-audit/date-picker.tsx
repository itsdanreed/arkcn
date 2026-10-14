import { useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import { Label } from "../ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../ui/input-group"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { useAuditMotion } from "../../src/audit-motion"
function Case({ state }: { state: string }) {
  const [value, setValue] = useState<Date | undefined>(state === "empty" ? undefined : new Date(2026, 9, 15))
  const [open, setOpen] = useState(false)
  return (
    <section data-audit-case={state} className="flex w-72 max-w-full flex-col gap-1.5">
      <Label htmlFor={state}>{state} date</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <InputGroup>
          <InputGroupInput
            id={state}
            value={value?.toLocaleDateString("en-US") ?? ""}
            onChange={() => {}}
            placeholder="mm/dd/yyyy"
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
          />
          <InputGroupAddon align="inline-end">
            <PopoverTrigger
              render={<InputGroupButton size="icon-xs" />}
              disabled={state === "disabled"}
              aria-label={`Choose ${state} date`}
            >
              <CalendarIcon />
            </PopoverTrigger>
          </InputGroupAddon>
          {value && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                disabled={state === "disabled"}
                aria-label={`Clear ${state} date`}
                onClick={() => setValue(undefined)}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <PopoverContent className="w-auto p-0" align="end" data-audit-popup={state}>
          <Calendar
            mode="single"

            defaultMonth={new Date(2026, 9, 1)}
            selected={value}
            disabled={{ before: new Date(2026, 9, 5) }}
            onSelect={(date) => {
              setValue(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </section>
  )
}
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="popover-content"]', 300)
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid"].map((state) => (
        <Case key={state} state={state} />
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
