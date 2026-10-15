import { NumberInput } from "@multicomma/arkcn-react-native/ui/number-input"

export default function NumberInputExample() {
  return (
    <NumberInput.Root defaultValue="3" min={0} max={10} style={{ width: 192 }}>
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.Input />
        <NumberInput.Triggers />
      </NumberInput.Control>
    </NumberInput.Root>
  )
}
