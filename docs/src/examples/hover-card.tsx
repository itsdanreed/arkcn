import { Button } from "@/components/ui/button"
import { HoverCard } from "@/components/ui/hover-card"

export default function HoverCardExample() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Button variant="link">@arkcn</Button>
      </HoverCard.Trigger>
      <HoverCard.Content className="w-72 text-sm">
        <p className="font-medium">arkcn</p>
        <p className="text-muted-foreground">shadcn/ui-style components on Ark UI.</p>
      </HoverCard.Content>
    </HoverCard.Root>
  )
}
