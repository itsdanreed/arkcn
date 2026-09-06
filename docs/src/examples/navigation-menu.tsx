import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const items = [
  { title: "Installation", href: "#", text: "Set up a project with the CLI." },
  { title: "Theming", href: "#", text: "Tokens, dark mode, custom variants." },
  { title: "Conventions", href: "#", text: "Parts, slots, and polymorphism." },
]

export default function NavigationMenuExample() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-80 gap-1 p-2">
              {items.map((i) => (
                <li key={i.title}>
                  <NavigationMenuLink href={i.href} className="flex flex-col gap-0.5 rounded-md p-2 hover:bg-muted">
                    <span className="text-sm font-medium">{i.title}</span>
                    <span className="text-xs text-muted-foreground">{i.text}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Components
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
