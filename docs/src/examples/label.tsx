import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function LabelExample() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox.Root ids={{ hiddenInput: "label-example-checkbox" }}>
        <Checkbox.Control>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>
            <MinusIcon />
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Label.Root htmlFor="label-example-checkbox">Accept terms and conditions</Label.Root>
    </div>
  )
}
