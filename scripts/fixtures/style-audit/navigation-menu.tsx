import { useAuditMotion } from "../../src/audit-motion"
import { NavigationMenu } from "../adapters/navigation-menu"
export default function Example() {
  const motion = useAuditMotion(
    '[data-slot="navigation-menu-content"],[data-slot="navigation-menu-viewport"],nav:has(>div>[data-slot="navigation-menu-content"])',
    420
  )
  return (
    <section data-audit-case="navigation">
      <NavigationMenu.Root defaultValue="first">
        <NavigationMenu.List>
          <NavigationMenu.Item value="first">
            <NavigationMenu.Trigger>Getting started</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <div className="grid w-80 gap-1 p-2">
                <NavigationMenu.Link href="#install">Installation</NavigationMenu.Link>
                <NavigationMenu.Link href="#theme">Theming</NavigationMenu.Link>
                <NavigationMenu.Link href="#conventions">Conventions</NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="second">
            <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <div className="grid w-56 gap-1 p-2">
                <NavigationMenu.Link href="#guides">Guides</NavigationMenu.Link>
                <NavigationMenu.Link href="#examples">Examples</NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="disabled">
            <NavigationMenu.Trigger disabled>Disabled</NavigationMenu.Trigger>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="current">
            <NavigationMenu.Link href="#current" active>
              Current
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <output data-motion-trace={motion.trace} className="mt-64 block text-xs text-muted-foreground">
        Switch panels to sample popup motion.
      </output>
    </section>
  )
}
