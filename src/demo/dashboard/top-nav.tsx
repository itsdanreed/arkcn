import { AppShellTopNav, AppShellTopNavLink, AppShellTopNavMenu } from "@/components/ui/app-shell"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { dashboardTopNav } from "./data"

/** The dashboard's secondary navigation: inline links on large screens, a menu below. */
export function DashboardTopNav() {
  return (
    <>
      <AppShellTopNavMenu>
        {dashboardTopNav.map((link) => (
          <DropdownMenuItem key={link.href} value={link.href} asChild disabled={link.disabled}>
            <a href={`#${link.href}`} className={cn(!link.active && "text-muted-foreground")}>
              {link.title}
            </a>
          </DropdownMenuItem>
        ))}
      </AppShellTopNavMenu>
      <AppShellTopNav>
        {dashboardTopNav.map((link) => (
          <AppShellTopNavLink
            key={link.href}
            href={`#${link.href}`}
            active={link.active}
            aria-disabled={link.disabled || undefined}
            className={cn(link.disabled && "pointer-events-none opacity-60")}
          >
            {link.title}
          </AppShellTopNavLink>
        ))}
      </AppShellTopNav>
    </>
  )
}
