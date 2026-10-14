import { HomeIcon, InboxIcon } from "lucide-react"
import { AppShell } from "@/components/ui/app-shell"

export default function AppShellExample() {
  return (
    <AppShell.Root
      defaultCollapsible="none"
      defaultVariant="sidebar"
      searchShortcut={false}
      className="min-h-80 overflow-hidden rounded-lg border"
    >
      <AppShell.Sidebar className="w-40 border-r">
        <AppShell.Brand>
          <AppShell.BrandText>
            <AppShell.BrandTitle>Acme</AppShell.BrandTitle>
            <AppShell.BrandDescription>Workspace</AppShell.BrandDescription>
          </AppShell.BrandText>
        </AppShell.Brand>
        <AppShell.Nav>
          <AppShell.NavLabel>Workspace</AppShell.NavLabel>
          <AppShell.NavList>
            <AppShell.NavItem>
              <AppShell.NavLink active asChild={false}>
                <HomeIcon />
                <span>Overview</span>
              </AppShell.NavLink>
            </AppShell.NavItem>
            <AppShell.NavItem>
              <AppShell.NavLink asChild={false}>
                <InboxIcon />
                <span>Inbox</span>
              </AppShell.NavLink>
            </AppShell.NavItem>
          </AppShell.NavList>
        </AppShell.Nav>
      </AppShell.Sidebar>
      <AppShell.Content>
        <AppShell.Header>
          <AppShell.TopNav>
            <AppShell.TopNavLink active href="#overview">
              Overview
            </AppShell.TopNavLink>
          </AppShell.TopNav>
        </AppShell.Header>
        <AppShell.Main>
          <h2 className="text-lg font-medium">Overview</h2>
          <p className="text-sm text-muted-foreground">Your workspace at a glance.</p>
        </AppShell.Main>
      </AppShell.Content>
    </AppShell.Root>
  )
}
