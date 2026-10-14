import { RadioGroup } from "@multicomma/arkcn-react-native/ui/radio-group"
export default function RadioGroupExample() {
  return (
    <RadioGroup.Root defaultValue="comfortable" accessibilityLabel="Display density" style={{ gap: 12 }}>
      <RadioGroup.Item value="default">Default</RadioGroup.Item>
      <RadioGroup.Item value="comfortable">Comfortable</RadioGroup.Item>
      <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
    </RadioGroup.Root>
  )
}
