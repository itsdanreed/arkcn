import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-24 p-12">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <section key={side} data-audit-case={side} className="flex justify-center">
          <Tooltip.Root defaultOpen positioning={{ placement: side }}>
            <Tooltip.Trigger asChild>
              <Button variant="outline">{side}</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Add to library</Tooltip.Content>
          </Tooltip.Root>
        </section>
      ))}
    </div>
  )
}
