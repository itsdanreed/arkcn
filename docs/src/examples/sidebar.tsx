import { HomeIcon, InboxIcon, SettingsIcon } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

export default function SidebarExample() {
  return (
    <Sidebar.Provider className="min-h-80 overflow-hidden rounded-lg border">
      <Sidebar.Root collapsible="none" className="w-48 border-r">
        <Sidebar.Header>
          <Sidebar.Input placeholder="Search…" aria-label="Search navigation" />
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton isActive>
                    <HomeIcon />
                    <span>Overview</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <InboxIcon />
                    <span>Inbox</span>
                  </Sidebar.MenuButton>
                  <Sidebar.MenuBadge>12</Sidebar.MenuBadge>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton disabled>
                    <SettingsIcon />
                    <span>Settings</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Separator />
        <Sidebar.Footer className="text-xs text-muted-foreground">Personal workspace</Sidebar.Footer>
      </Sidebar.Root>
      <Sidebar.Inset className="p-4 text-sm">Your workspace content.</Sidebar.Inset>
    </Sidebar.Provider>
  )
}
