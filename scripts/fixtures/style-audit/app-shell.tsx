/* eslint-disable better-tailwindcss/enforce-canonical-classes -- Preserve pinned shadcn recipe classes. */
import { useState } from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"
import {
  Boxes,
  Home,
  Inbox,
  Settings,
  ChevronsUpDown,
  ChevronRight,
  Sun,
  Moon,
  Check,
  Search,
  Bell,
  Menu,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { Button } from "../ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu"
import { Command } from "../adapters/command"
import { Kbd } from "../ui/kbd"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "../ui/popover"
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "../ui/item"
import { useAuditMotion } from "../../src/audit-motion"
// Pinned sidebar-07 page, team-switcher, and nav-user recipes composed with raw Nova primitives.
// The contained viewport and reduced navigation data are fixture adaptations. Theme menu is a raw Button/menu baseline.
export default function Example() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [active, setActive] = useState("Overview")
  const [theme, setTheme] = useState("system")
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
    <DirectionProvider direction={direction}>
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
        <SidebarProvider
          open={open}
          onOpenChange={setOpen}
          className="min-h-0 rounded-lg border"
          style={{ "--sidebar-width": "12rem" } as React.CSSProperties}
        >
          <Sidebar
            variant={variant}
            collapsible={collapse}
            side={direction === "rtl" ? "right" : "left"}
            dir={direction}
          >
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    aria-label="Acme workspace"
                    className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Boxes className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Acme</span>
                      <span className="truncate text-xs">Workspace</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarMenu>
                  {["Overview", "Inbox"].map((name) => (
                    <SidebarMenuItem key={name}>
                      <SidebarMenuButton isActive={active === name} tooltip={name} onClick={() => setActive(name)}>
                        {name === "Overview" ? <Home /> : <Inbox />}
                        <span>{name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SettingsNav active={active} onSelect={() => setActive("General")} />
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" aria-label="Alex Morgan account" className="aria-expanded:bg-muted">
                    <Avatar>
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Alex Morgan</span>
                      <span className="truncate text-xs">alex@example.com</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="@container/content min-w-0" style={scrolling ? { height: 360 } : undefined}>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
                {/* MainNav ghost/sm composition from pinned apps/v4/components/main-nav.tsx, using Nova Button. */}
                <nav aria-label="Workspace navigation" className="hidden items-center gap-0 lg:flex">
                  {["Overview", "Inbox"].map((name) => (
                    <Button
                      key={name}
                      variant="ghost"
                      size="sm"
                      className="px-2.5"
                      render={
                        <a
                          href={`#${name.toLowerCase()}`}
                          aria-current={active === name ? "page" : undefined}
                          className="relative items-center"
                          onClick={(event) => {
                            event.preventDefault()
                            setActive(name)
                          }}
                        />
                      }
                    >
                      {name}
                    </Button>
                  ))}
                </nav>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon" className="lg:hidden" />}
                    aria-label="Toggle navigation menu"
                  >
                    <Menu />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {["Overview", "Inbox"].map((name) => (
                      <DropdownMenuItem key={name} onClick={() => setActive(name)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            {/* Fixed height and optional width cap are disclosed fixture layouts, not upstream shell behavior. */}
            <div
              data-audit-scroll
              className={`${scrolling ? "min-h-0 overflow-y-auto" : "min-h-80"} ${fluid ? "" : "@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl"} flex flex-1 flex-col gap-4 p-4 pt-0`}
            >
              <div className="shrink-0 space-y-4">
                <h2 className="text-lg font-medium">{active}</h2>
                <p className="text-sm text-muted-foreground">Your workspace at a glance.</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full min-w-0 flex-1 justify-start font-normal text-muted-foreground sm:w-40 md:flex-none lg:w-52 xl:w-64"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search />
                    <span className="truncate">Search</span>
                    <Kbd className="ms-auto hidden sm:flex">⌘K</Kbd>
                  </Button>
                  <Notifications />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="outline" size="icon" className="relative" />}
                      aria-label="Toggle theme"
                    >
                      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {["light", "dark", "system"].map((value) => (
                        <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
                          <span className="capitalize">{value}</span>
                          {theme === value && <Check className="ml-auto size-3.5" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Command.Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                  <Command.Root>
                    <Command.Input placeholder="Search workspace" />
                    <Command.Content>
                      <Command.Empty>No results found.</Command.Empty>
                      <Command.ItemGroup heading="Pages">
                        {["Overview", "Inbox", "General"].map((name) => (
                          <Command.Item
                            key={name}
                            value={name}
                            onSelect={() => {
                              setActive(name)
                              setSearchOpen(false)
                            }}
                          >
                            {name}
                          </Command.Item>
                        ))}
                      </Command.ItemGroup>
                    </Command.Content>
                  </Command.Root>
                </Command.Dialog>
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
            </div>
          </SidebarInset>
        </SidebarProvider>
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
    </DirectionProvider>
  )
}
function SettingsNav({ active, onSelect }: { active: string; onSelect: () => void }) {
  const { state, isMobile } = useSidebar()
  if (state === "collapsed" && !isMobile)
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton tooltip="Settings" />}>
            <Settings />
            <span>Settings</span>
            <ChevronRight className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={onSelect}>General</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  return (
    <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger render={<SidebarMenuButton />}>
          <Settings />
          <span>Settings</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                isActive={active === "General"}
                href="#general"
                onClick={(e) => {
                  e.preventDefault()
                  onSelect()
                }}
              >
                General
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

// Related primitive baseline, not an upstream notification recipe. Width/header/footer layout
// are fixture compositions. Ark unread tint, dot, icon disc, and compact list remain extensions.
function Notifications() {
  const [unread, setUnread] = useState(true)
  const [empty, setEmpty] = useState(false)
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" />}
        aria-label={unread && !empty ? "Notifications, 2 unread" : "Notifications"}
      >
        <Bell />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 p-0 sm:w-96">
        <div className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5">
          <PopoverTitle>Notifications</PopoverTitle>
          <Button
            variant="link"
            size="sm"
            disabled={!unread || empty}
            onClick={() => setUnread(false)}
            className="h-auto p-0 text-xs text-muted-foreground"
          >
            Mark all as read
          </Button>
        </div>
        {empty ? (
          <div className="flex flex-col items-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground">
            <Bell className="mb-1 size-6" />
            You're all caught up.
          </div>
        ) : (
          <div className="p-1">
            {["Build complete", "New comment"].map((title) => (
              <Item key={title} size="xs" render={<button type="button" onClick={() => setUnread(false)} />}>
                <ItemMedia variant="icon">
                  <Inbox />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{title}</ItemTitle>
                  <ItemDescription>Your workspace has an update.</ItemDescription>
                  <time className="text-xs text-muted-foreground">2 minutes ago</time>
                </ItemContent>
              </Item>
            ))}
          </div>
        )}
        <div className="flex justify-center border-t px-3.5 py-2">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground"
            onClick={() => {
              setEmpty(!empty)
              setUnread(true)
            }}
          >
            {empty ? "Restore notifications" : "Clear notifications"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
