import { Button } from "../adapters/button"
import { Tooltip } from "../adapters/tooltip"
export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-24 p-12">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <section key={side} data-audit-case={side} className="flex justify-center">
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger asChild>
              <Button variant="outline">{side}</Button>
            </Tooltip.Trigger>
            <Tooltip.Content side={side}>Add to library</Tooltip.Content>
          </Tooltip.Root>
        </section>
      ))}
    </div>
  )
}
