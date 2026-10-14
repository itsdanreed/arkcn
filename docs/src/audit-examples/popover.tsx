import { Popover } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "180px 32px", padding: "120px 48px" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <section key={side} data-audit-case={side} className="flex justify-center">
          <Popover.Root defaultOpen positioning={{ placement: side }}>
            <Popover.Trigger asChild>
              <Button variant="outline">{side}</Button>
            </Popover.Trigger>
            <Popover.Content data-audit-popup={side}>
              <p className="font-medium">Details</p>
              <p className="text-muted-foreground">A matching popup panel.</p>
            </Popover.Content>
          </Popover.Root>
        </section>
      ))}
    </div>
  )
}
