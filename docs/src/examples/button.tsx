import { MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ButtonExample() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">
        <MailIcon /> Email
      </Button>
      <Button size="icon" aria-label="Email">
        <MailIcon />
      </Button>
    </div>
  )
}
