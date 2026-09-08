import { Link } from "@docs/router"
import { NavigationMenu, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

const items = [
  { title: "Installation", href: "/docs/installation", text: "Set up a project with the CLI." },
  { title: "Theming", href: "/docs/theming", text: "Tokens, dark mode, custom variants." },
  { title: "Conventions", href: "/docs/conventions", text: "Parts, slots, and polymorphism." },
]

export default function NavigationMenuExample() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Getting started</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul className="grid w-80 gap-1 p-2">
              {items.map((i) => (
                <li key={i.title}>
                  <NavigationMenu.Link asChild className="flex flex-col gap-0.5 rounded-md p-2 hover:bg-muted">
                    <Link to={i.href}>
                      <span className="text-sm font-medium">{i.title}</span>
                      <span className="text-xs text-muted-foreground">{i.text}</span>
                    </Link>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className={navigationMenuTriggerStyle()}>
            <Link to="/docs/components">Components</Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
