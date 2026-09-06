import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemHiddenInput,
  RadioGroupItemText,
} from "@/components/ui/radio-group"

export default function RadioGroupExample() {
  return (
    <RadioGroup defaultValue="comfortable">
      {["default", "comfortable", "compact"].map((v) => (
        <RadioGroupItem key={v} value={v}>
          <RadioGroupItemControl />
          <RadioGroupItemText className="capitalize">{v}</RadioGroupItemText>
          <RadioGroupItemHiddenInput />
        </RadioGroupItem>
      ))}
    </RadioGroup>
  )
}
