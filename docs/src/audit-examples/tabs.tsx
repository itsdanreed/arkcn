import { Tabs } from "@/components/ui/tabs"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["horizontal", "vertical"] as const).flatMap((orientation) =>
        (["default", "line"] as const).map((variant) => (
          <div key={orientation + variant} data-audit-case={orientation + " " + variant}>
            <Tabs.Root orientation={orientation} defaultValue="First">
              <Tabs.List variant={variant}>
                {["First", "Second", "Disabled"].map((name) => (
                  <Tabs.Trigger key={name} value={name} disabled={name === "Disabled"}>
                    {name}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <Tabs.Content value="First">First panel</Tabs.Content>
              <Tabs.Content value="Second">Second panel</Tabs.Content>
            </Tabs.Root>
          </div>
        ))
      )}
    </div>
  )
}
