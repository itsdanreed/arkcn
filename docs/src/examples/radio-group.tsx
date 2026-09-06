import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// RadioGroupItem renders the control, the label text, and the hidden input for you.
export default function RadioGroupExample() {
  return (
    <RadioGroup defaultValue="comfortable" className="flex flex-col gap-3">
      <RadioGroupItem value="default">Default</RadioGroupItem>
      <RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
      <RadioGroupItem value="compact">Compact</RadioGroupItem>
    </RadioGroup>
  )
}
