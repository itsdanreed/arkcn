import { Collapsible } from "../adapters/collapsible"
import { Button } from "../adapters/button"
export default function Example() {
  return (
    <div className="max-w-sm space-y-6">
      {[false, true].map((disabled) => (
        <section data-audit-case={disabled ? "disabled" : "enabled"} key={String(disabled)}>
          <Collapsible.Root disabled={disabled}>
            <Collapsible.Trigger asChild>
              <Button variant="outline">{disabled ? "Disabled panel" : "Toggle panel"}</Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-3 rounded-lg border p-4 text-sm">
              Panel content with two lines.
              <br />
              Second line.
            </Collapsible.Content>
          </Collapsible.Root>
        </section>
      ))}
    </div>
  )
}
