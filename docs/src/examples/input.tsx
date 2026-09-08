import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputExample() {
  return (
    <div className="grid w-72 gap-2">
      <Label.Root htmlFor="email">Email</Label.Root>
      <Input.Root id="email" type="email" placeholder="name@example.com" />
    </div>
  )
}
