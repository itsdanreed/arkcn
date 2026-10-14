import { Label } from "../ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../ui/input-group"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Button } from "../ui/button"
import { useAuditMotion } from "../../src/audit-motion"
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="popover-content"]')
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "readonly"].map((state) => (
        <section key={state} data-audit-case={state} className="w-72 max-w-full">
          <Popover open={state === "readonly" ? false : undefined}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`color-${state}`}>{state}</Label>
              <InputGroup>
                <InputGroupInput
                  id={`color-${state}`}
                  aria-label={state}
                  defaultValue="#3B82F6"
                  disabled={state === "disabled"}
                  readOnly={state === "readonly"}
                  aria-invalid={state === "invalid" || undefined}
                />
                <InputGroupAddon>
                  <PopoverTrigger
                    disabled={state === "disabled"}
                    render={<InputGroupButton size="icon-xs" aria-label={`Open ${state}`} />}
                  >
                    <span className="size-5 rounded-sm bg-[#3b82f6]" />
                  </PopoverTrigger>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <PopoverContent align="start" className="w-64">
              <div className="h-16">Color options</div>
              <Button variant="outline" size="sm">
                Format
              </Button>
            </PopoverContent>
          </Popover>
        </section>
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
