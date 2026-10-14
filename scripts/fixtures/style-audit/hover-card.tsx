import { HoverCard } from "../adapters/hover-card"
import { Button } from "../adapters/button"
export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "180px 32px", padding: "120px 48px" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <section key={side} data-audit-case={side} className="flex justify-center">
          <HoverCard.Root defaultOpen>
            <HoverCard.Trigger asChild>
              <Button variant="outline">{side}</Button>
            </HoverCard.Trigger>
            <HoverCard.Content side={side} data-audit-popup={side}>
              <p className="font-medium">Details</p>
              <p className="text-muted-foreground">A matching popup panel.</p>
            </HoverCard.Content>
          </HoverCard.Root>
        </section>
      ))}
    </div>
  )
}
