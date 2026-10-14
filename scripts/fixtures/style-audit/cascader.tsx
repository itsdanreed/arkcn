import { Select, SelectTrigger, SelectValue } from "../ui/select"
import { Combobox, ComboboxEmpty } from "../ui/combobox"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Button } from "../ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { useAuditMotion } from "../../src/audit-motion"
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="popover-content"]')
  return (
    <div className="space-y-5">
      {["default", "small", "empty", "disabled", "invalid", "readonly"].map((state) => (
        <section data-audit-case={state} key={state} className="w-72 max-w-full">
          <Select
            defaultValue={state === "empty" ? null : "Engineering"}
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
          >
            <SelectTrigger
              className="w-full"
              aria-label={state}
              aria-invalid={state === "invalid" || undefined}
              size={state === "small" ? "sm" : "default"}
            >
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
          </Select>
        </section>
      ))}
      <section data-audit-case="popup" className="w-72 max-w-full">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" className="w-full justify-between" />}>
            Select team
            <ChevronDownIcon />
          </PopoverTrigger>
          <PopoverContent align="start">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput aria-label="Find team" placeholder="Find team" />
            </InputGroup>
            <Combobox items={[]}>
              <div className="group/combobox-content" data-empty="">
                <ComboboxEmpty>No results</ComboboxEmpty>
              </div>
            </Combobox>
          </PopoverContent>
        </Popover>
      </section>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
