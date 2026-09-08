import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxExample() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>
            <MinusIcon />
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root>
        <Checkbox.Control>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>
            <MinusIcon />
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Subscribe to the newsletter</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <Checkbox.Root disabled>
        <Checkbox.Control>
          <Checkbox.Indicator>
            <CheckIcon />
          </Checkbox.Indicator>
          <Checkbox.Indicator indeterminate>
            <MinusIcon />
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Disabled</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
    </div>
  )
}
