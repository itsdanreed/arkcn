import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CheckboxExample() {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox defaultChecked /> Accept terms and conditions
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox /> Subscribe to the newsletter
      </label>
      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox disabled /> Disabled
      </Label>
    </div>
  )
}
