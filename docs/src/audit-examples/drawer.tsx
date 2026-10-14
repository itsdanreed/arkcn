import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const { trace } = useAuditMotion(
    '[data-slot="drawer-content"],[data-slot="drawer-popup"],[data-slot="drawer-overlay"]',
    550
  )
  return (
    <div className="flex flex-wrap gap-3">
      {(["top", "right", "bottom", "left"] as const).map((variant) => (
        <Drawer.Root key={variant} direction={variant}>
          <Drawer.Trigger asChild>
            <Button variant="outline">Open {variant}</Button>
          </Drawer.Trigger>
          <Drawer.Content showSwipeHandle data-audit-case={variant}>
            <Drawer.Header>
              <Drawer.Title>Edit profile</Drawer.Title>
              <Drawer.Description>
                Make changes to your profile here. Review your information before saving the changes.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Drawer.CloseTrigger>
              <Drawer.CloseTrigger asChild>
                <Button>Save changes</Button>
              </Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
