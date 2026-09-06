import {
  NumberInput,
  NumberInputControl,
  NumberInputInput,
  NumberInputLabel,
  NumberInputTriggers,
} from "@/components/ui/number-input"

export default function NumberInputExample() {
  return (
    <NumberInput defaultValue="3" min={0} max={10} className="w-48">
      <NumberInputLabel>Quantity</NumberInputLabel>
      <NumberInputControl>
        <NumberInputInput />
        <NumberInputTriggers />
      </NumberInputControl>
    </NumberInput>
  )
}
