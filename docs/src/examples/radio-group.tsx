import { RadioGroup } from "@/components/ui/radio-group"

// RadioGroupItem renders the control, the label text, and the hidden input for you.
export default function RadioGroupExample() {
  return (
    <RadioGroup.Root defaultValue="comfortable" className="flex flex-col gap-3">
      <RadioGroup.Item value="default">Default</RadioGroup.Item>
      <RadioGroup.Item value="comfortable">Comfortable</RadioGroup.Item>
      <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
    </RadioGroup.Root>
  )
}
