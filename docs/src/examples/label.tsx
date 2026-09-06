import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function LabelExample() {
  return (
    <Label className="flex items-center gap-2">
      <Checkbox /> Accept terms and conditions
    </Label>
  )
}
