import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function HoverCardExample() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@arkcn</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm">
        <p className="font-medium">arkcn</p>
        <p className="text-muted-foreground">shadcn/ui-style components on Ark UI.</p>
      </HoverCardContent>
    </HoverCard>
  )
}
