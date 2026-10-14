import { useState } from "react"
import { LocaleProvider } from "@ark-ui/react"
import { Boxes, Home, Inbox, Settings, ChevronsUpDown, Bell } from "lucide-react"
import { AppShell, useAppShell } from "@/components/ui/app-shell"
import { Sidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Command, useFilter, useListCollection } from "@/components/ui/command"
import { useAuditMotion } from "../audit-motion"

export default function Example() {
  const [active, setActive] = useState("Overview")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [variant, setVariant] = useState<"sidebar" | "inset" | "floating">("sidebar")
  const [collapse, setCollapse] = useState<"none" | "icon" | "offcanvas">("none")
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr")
  const [open, setOpen] = useState(true)
  const [scrolling, setScrolling] = useState(false)
  const [fluid, setFluid] = useState(false)
  const { trace } = useAuditMotion(
    '[data-slot="sidebar"][data-state], [data-slot="sidebar-gap"], [data-slot="sidebar-container"], [data-slot="app-shell-sidebar"], header, [data-slot="collapsible-content"], [role="menu"], [role="dialog"]'
  )
  const { trace: gapTrace } = useAuditMotion('[data-slot="sidebar-gap"]')
  const { trace: panelTrace } = useAuditMotion('[data-slot="sidebar-container"], [data-slot="app-shell-sidebar"]')
  const { trace: headerTrace } = useAuditMotion("header")
  return (
    <LocaleProvider locale={direction === "rtl" ? "ar" : "en"}>
      <div className="w-full space-y-4" dir={direction}>
        <div className={`relative flex flex-wrap gap-2 ${collapse === "none" ? "" : "md:ps-52"}`}>
          <label>
            Variant{" "}
            <select
              aria-label="Variant"
              value={variant}
              onChange={(event) => {
                setVariant(event.target.value as typeof variant)
                setOpen(true)
              }}
            >
              {["sidebar", "inset", "floating"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Collapse{" "}
            <select
              aria-label="Collapse"
              value={collapse}
              onChange={(event) => {
                setCollapse(event.target.value as typeof collapse)
                setOpen(true)
              }}
            >
              {["none", "icon", "offcanvas"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Direction{" "}
            <select
              aria-label="Direction"
              value={direction}
              onChange={(event) => {
                setDirection(event.target.value as typeof direction)
                setOpen(true)
              }}
            >
              {["ltr", "rtl"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
            Toggle desktop sidebar
          </Button>
          <Button variant="outline" size="sm" aria-pressed={scrolling} onClick={() => setScrolling(!scrolling)}>
            Scrolling layout
          </Button>
          <Button variant="outline" size="sm" aria-pressed={fluid} onClick={() => setFluid(!fluid)}>
            Fluid width
          </Button>
        </div>
        <AppShell.Root
          variant={variant}
          collapsible={collapse}
          open={open}
          onOpenChange={setOpen}
          className="min-h-0 rounded-lg border"
          style={{ "--sidebar-width": "12rem" } as React.CSSProperties}
        >
          <AppShell.SkipLink />
          <AppShell.Sidebar side={direction === "rtl" ? "right" : "left"} dir={direction}>
            <Sidebar.Header>
              <AppShell.Brand aria-label="Acme workspace">
                <AppShell.BrandLogo>
                  <Boxes />
                </AppShell.BrandLogo>
                <AppShell.BrandText>
                  <AppShell.BrandTitle>Acme</AppShell.BrandTitle>
                  <AppShell.BrandDescription>Workspace</AppShell.BrandDescription>
                </AppShell.BrandText>
                <AppShell.BrandChevron />
              </AppShell.Brand>
            </Sidebar.Header>
            <Sidebar.Content>
              <AppShell.Nav>
                <AppShell.NavLabel>Workspace</AppShell.NavLabel>
                <AppShell.NavList>
                  {["Overview", "Inbox"].map((name) => (
                    <AppShell.NavItem key={name}>
                      <AppShell.NavLink
                        asChild={false}
                        active={active === name}
                        tooltip={name}
                        onClick={() => setActive(name)}
                      >
                        {name === "Overview" ? <Home /> : <Inbox />}
                        <span>{name}</span>
                      </AppShell.NavLink>
                    </AppShell.NavItem>
                  ))}
                  <AppShell.NavCollapsible
                    tooltip="Settings"
                    trigger={
                      <>
                        <Settings />
                        <span>Settings</span>
                      </>
                    }
                    menu={
                      <AppShell.NavMenuLink asChild={false} value="general" onSelect={() => setActive("General")}>
                        General
                      </AppShell.NavMenuLink>
                    }
                  >
                    <AppShell.NavSubItem>
                      <AppShell.NavSubLink
                        asChild={false}
                        active={active === "General"}
                        href="#general"
                        onClick={(event) => {
                          event.preventDefault()
                          setActive("General")
                        }}
                      >
                        General
                      </AppShell.NavSubLink>
                    </AppShell.NavSubItem>
                  </AppShell.NavCollapsible>
                </AppShell.NavList>
              </AppShell.Nav>
            </Sidebar.Content>
            <Sidebar.Footer>
              <AppShell.User aria-label="Alex Morgan account">
                <AppShell.UserAvatar fallback="AM" />
                <AppShell.UserText>
                  <AppShell.UserName>Alex Morgan</AppShell.UserName>
                  <AppShell.UserEmail>alex@example.com</AppShell.UserEmail>
                </AppShell.UserText>
                <ChevronsUpDown className="ms-auto size-4" />
              </AppShell.User>
            </Sidebar.Footer>
          </AppShell.Sidebar>
          <AppShell.Content className="min-w-0" style={scrolling ? { height: 360 } : undefined}>
            <AppShell.Header fixed={scrolling}>
              <AppShell.TopNav aria-label="Workspace navigation">
                {["Overview", "Inbox"].map((name) => (
                  <AppShell.TopNavLink
                    key={name}
                    href={`#${name.toLowerCase()}`}
                    active={active === name}
                    onClick={(event) => {
                      event.preventDefault()
                      setActive(name)
                    }}
                  >
                    {name}
                  </AppShell.TopNavLink>
                ))}
              </AppShell.TopNav>
              <AppShell.TopNavMenu>
                {["Overview", "Inbox"].map((name) => (
                  <DropdownMenu.Item key={name} value={name} onSelect={() => setActive(name)}>
                    {name}
                  </DropdownMenu.Item>
                ))}
              </AppShell.TopNavMenu>
            </AppShell.Header>
            <AppShell.Main fixed={scrolling} fluid={fluid} className={scrolling ? "space-y-4" : "min-h-80 space-y-4"}>
              <div className="shrink-0 space-y-4">
                <h2 className="text-lg font-medium">{active}</h2>
                <p className="text-sm text-muted-foreground">Your workspace at a glance.</p>
                <div className="flex items-center gap-2">
                  <AppShell.Search />
                  <Notifications />
                  <AppShell.ThemeToggle theme={theme} onThemeChange={setTheme} />
                </div>
                <SearchCommands onSelect={setActive} />
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Theme preference: {theme}
                </p>
                {scrolling && (
                  <div className="space-y-4">
                    {Array.from({ length: 12 }, (_, i) => (
                      <section key={i} className="space-y-2">
                        <h3 className="text-sm font-medium">Section {i + 1}</h3>
                        <p className="text-sm text-muted-foreground">
                          Scroll the workspace while the navigation stays visible.
                        </p>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </AppShell.Main>
          </AppShell.Content>
        </AppShell.Root>
        <output hidden data-audit-gap-motion>
          {gapTrace}
        </output>
        <output hidden data-audit-panel-motion>
          {panelTrace}
        </output>
        <output hidden data-audit-header-motion>
          {headerTrace}
        </output>
        <output hidden data-audit-motion>
          {trace}
        </output>
      </div>
    </LocaleProvider>
  )
}

const commands = ["Overview", "Inbox", "General"]
function SearchCommands({ onSelect }: { onSelect: (value: string) => void }) {
  const { setSearchOpen } = useAppShell()
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: commands, filter: contains })
  return (
    <AppShell.CommandDialog>
      <Command.Root
        collection={collection}
        onSelect={({ value }) => {
          onSelect(value)
          setSearchOpen(false)
        }}
      >
        <Command.Input placeholder="Search workspace" onValueChange={filter} />
        <Command.Content>
          <Command.Empty>No results found.</Command.Empty>
          <Command.ItemGroup heading="Pages">
            {collection.items.map((item) => (
              <Command.Item key={item} item={item}>
                {item}
              </Command.Item>
            ))}
          </Command.ItemGroup>
        </Command.Content>
      </Command.Root>
    </AppShell.CommandDialog>
  )
}
function Notifications() {
  const [unread, setUnread] = useState(true)
  const [empty, setEmpty] = useState(false)
  return (
    <AppShell.Notifications>
      <AppShell.NotificationsTrigger count={empty ? 0 : unread ? 2 : 0} />
      <AppShell.NotificationsContent>
        <AppShell.NotificationsHeader>
          <AppShell.NotificationsTitle>Notifications</AppShell.NotificationsTitle>
          <AppShell.NotificationsActionTrigger disabled={!unread || empty} onClick={() => setUnread(false)}>
            Mark all as read
          </AppShell.NotificationsActionTrigger>
        </AppShell.NotificationsHeader>
        {empty ? (
          <AppShell.NotificationsEmpty>
            <Bell />
            You're all caught up.
          </AppShell.NotificationsEmpty>
        ) : (
          <AppShell.NotificationsList>
            {["Build complete", "New comment"].map((title) => (
              <AppShell.NotificationItem key={title} unread={unread} asChild>
                <button type="button" onClick={() => setUnread(false)}>
                  <AppShell.NotificationItemIcon>
                    <Inbox />
                  </AppShell.NotificationItemIcon>
                  <AppShell.NotificationItemContent>
                    <AppShell.NotificationItemTitle>{title}</AppShell.NotificationItemTitle>
                    <AppShell.NotificationItemDescription>
                      Your workspace has an update.
                    </AppShell.NotificationItemDescription>
                    <AppShell.NotificationItemTime>2 minutes ago</AppShell.NotificationItemTime>
                  </AppShell.NotificationItemContent>
                  <AppShell.NotificationItemIndicator />
                </button>
              </AppShell.NotificationItem>
            ))}
          </AppShell.NotificationsList>
        )}
        <AppShell.NotificationsFooter>
          <AppShell.NotificationsActionTrigger
            onClick={() => {
              setEmpty(!empty)
              setUnread(true)
            }}
          >
            {empty ? "Restore notifications" : "Clear notifications"}
          </AppShell.NotificationsActionTrigger>
        </AppShell.NotificationsFooter>
      </AppShell.NotificationsContent>
    </AppShell.Notifications>
  )
}
