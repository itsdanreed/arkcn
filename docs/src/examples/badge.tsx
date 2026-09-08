import { Badge } from "@/components/ui/badge"

export default function BadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge.Root>Default</Badge.Root>
      <Badge.Root variant="secondary">Secondary</Badge.Root>
      <Badge.Root variant="outline">Outline</Badge.Root>
      <Badge.Root variant="destructive">Destructive</Badge.Root>
    </div>
  )
}
