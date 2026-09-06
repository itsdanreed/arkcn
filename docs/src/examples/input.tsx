import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputExample() {
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  )
}
