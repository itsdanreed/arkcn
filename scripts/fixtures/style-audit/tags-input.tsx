import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxValue } from "../ui/combobox"
import { Label } from "../ui/label"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid", "wrapping"].map((state) => (
        <section key={state} data-audit-case={state} className="flex flex-col gap-1.5">
          <Label htmlFor={state}>{state} topics</Label>
          <Combobox
            multiple
            defaultValue={
              state === "empty"
                ? []
                : state === "wrapping"
                  ? ["react", "typescript", "accessibility", "design systems", "components"]
                  : ["react", "ark-ui"]
            }
            disabled={state === "disabled"}
          >
            <ComboboxChips data-audit-part="surface">
              <ComboboxValue>
                {(values: string[]) => values.map((value) => <ComboboxChip key={value}>{value}</ComboboxChip>)}
              </ComboboxValue>
              <ComboboxChipsInput
                id={state}
                placeholder="Add a topic…"
                aria-invalid={state === "invalid" || undefined}
              />
            </ComboboxChips>
          </Combobox>
        </section>
      ))}
    </div>
  )
}
