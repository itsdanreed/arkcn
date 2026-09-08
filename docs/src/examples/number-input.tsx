import { NumberInput } from "@/components/ui/number-input"

export default function NumberInputExample() {
  return (
    <NumberInput.Root defaultValue="3" min={0} max={10} className="w-48">
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.Triggers />
      </NumberInput.Control>
    </NumberInput.Root>
  )
}
