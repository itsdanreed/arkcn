import * as React from "react"
import { useTheme } from "next-themes"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellIcon,
  KeyboardIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LaptopIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SparklesIcon,
  SunIcon,
} from "lucide-react"
import {
  AppShell,
  AppShellBrand,
  AppShellBrandChevron,
  AppShellBrandDescription,
  AppShellBrandLogo,
  AppShellBrandText,
  AppShellBrandTitle,
  AppShellCommandDialog,
  AppShellContent,
  AppShellHeader,
  AppShellHeaderActions,
  AppShellMain,
  AppShellNav,
  AppShellNavBadge,
  AppShellNavCollapsible,
  AppShellNavItem,
  AppShellNavLabel,
  AppShellNavLink,
  AppShellNavList,
  AppShellNavMenuLink,
  AppShellNavSubItem,
  AppShellNavSubLink,
  AppShellSearch,
  AppShellSidebar,
  AppShellSidebarContent,
  AppShellSidebarFooter,
  AppShellSidebarHeader,
  AppShellSkipLink,
  AppShellThemeToggle,
  AppShellUser,
  AppShellUserAvatar,
  AppShellUserEmail,
  AppShellUserName,
  AppShellUserText,
  type Theme,
  useAppShell,
} from "@/components/ui/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useFilter,
  useListCollection,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HotkeysDialog, HotkeysProvider, useHotkey, useHotkeysDialog } from "@/components/ui/hotkeys"
import { useSidebar } from "@/components/ui/sidebar"
import { navGroups, teams, user } from "./nav-data"
import { isActive, useHashRoute } from "./router"
import { NotificationsMenu } from "./notifications"

type CommandEntry = { value: string; label: string; group: string; url?: string; theme?: Theme }

const commandEntries: CommandEntry[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      !item.items
        ? [{ value: item.url, label: item.title, group: group.title, url: item.url }]
        : item.items.map((sub) => ({
            value: sub.url,
            label: `${item.title} › ${sub.title}`,
            group: group.title,
            url: sub.url,
          }))
    )
  ),
  { value: "theme:light", label: "Light", group: "Theme", theme: "light" },
  { value: "theme:dark", label: "Dark", group: "Theme", theme: "dark" },
  { value: "theme:system", label: "System", group: "Theme", theme: "system" },
]

function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [active, setActive] = React.useState(teams[0])
  return (
    <DropdownMenu positioning={{ placement: isMobile ? "bottom-start" : "right-start", gutter: 4 }}>
      <DropdownMenuTrigger asChild>
        <AppShellBrand>
          <AppShellBrandLogo>
            <active.logo />
          </AppShellBrandLogo>
          <AppShellBrandText>
            <AppShellBrandTitle>{active.name}</AppShellBrandTitle>
            <AppShellBrandDescription>{active.plan}</AppShellBrandDescription>
          </AppShellBrandText>
          <AppShellBrandChevron />
        </AppShellBrand>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
          {teams.map((team, index) => (
            <DropdownMenuItem key={team.name} value={team.name} onSelect={() => setActive(team)} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <team.logo className="size-4 shrink-0" />
              </div>
              {team.name}
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem value="add-team" className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <PlusIcon className="size-4" />
          </div>
          <span className="font-medium text-muted-foreground">Add team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavUser({ navigate }: { navigate: (to: string) => void }) {
  const { isMobile } = useSidebar()
  return (
    <DropdownMenu positioning={{ placement: isMobile ? "bottom-end" : "right-end", gutter: 4 }}>
      <DropdownMenuTrigger asChild>
        <AppShellUser>
          <AppShellUserAvatar src={user.avatar} alt={user.name} fallback={user.initials} className="size-8" />
          <AppShellUserText>
            <AppShellUserName>{user.name}</AppShellUserName>
            <AppShellUserEmail>{user.email}</AppShellUserEmail>
          </AppShellUserText>
          <AppShellBrandChevron className="size-4" />
        </AppShellUser>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
              <Avatar className="size-8 rounded-lg">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm/tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem value="upgrade">
            <SparklesIcon /> Upgrade to Pro
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem value="account" onSelect={() => navigate("/settings/account")}>
            <BadgeCheckIcon /> Account
          </DropdownMenuItem>
          <DropdownMenuItem value="billing" onSelect={() => navigate("/settings")}>
            <CreditCardIcon /> Billing
          </DropdownMenuItem>
          <DropdownMenuItem value="notifications" onSelect={() => navigate("/settings/notifications")}>
            <BellIcon /> Notifications
          </DropdownMenuItem>
          <ShortcutsMenuItem />
          <DropdownMenuSeparator />
          <DropdownMenuItem value="sign-out" variant="destructive" onSelect={() => navigate("/sign-in")}>
            <LogOutIcon /> Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CommandMenu({ navigate }: { navigate: (to: string) => void }) {
  const { setTheme } = useTheme()
  const { searchOpen, setSearchOpen } = useAppShell()
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter, reset } = useListCollection<CommandEntry>({
    initialItems: commandEntries,
    itemToString: (e) => e.label,
    itemToValue: (e) => e.value,
    groupBy: (e) => e.group,
    filter: contains,
  })
  // The dialog content unmounts on close, but this hook lives on; clear the filter.
  React.useEffect(() => {
    if (!searchOpen) reset()
  }, [searchOpen, reset])
  const themeIcon = { light: SunIcon, dark: MoonIcon, system: LaptopIcon }
  return (
    <AppShellCommandDialog>
      <Command
        collection={collection}
        onSelect={({ value }) => {
          const entry = commandEntries.find((e) => e.value === value)
          setSearchOpen(false)
          if (entry?.url) navigate(entry.url)
          if (entry?.theme) setTheme(entry.theme)
        }}
      >
        <CommandInput placeholder="Type a command or search..." onValueChange={filter} />
        <CommandList className="max-h-72">
          <CommandEmpty>No results found.</CommandEmpty>
          {collection.group().map(([group, entries], index) => (
            <React.Fragment key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {entries.map((entry) => {
                  const Icon = entry.theme ? themeIcon[entry.theme] : null
                  return (
                    <CommandItem key={entry.value} item={entry} onSelect={() => undefined}>
                      {Icon ? (
                        <Icon />
                      ) : (
                        <div className="flex size-4 items-center justify-center">
                          <ArrowRightIcon className="size-2 text-muted-foreground/80" />
                        </div>
                      )}
                      {entry.label.includes(" › ") ? (
                        <>
                          {entry.label.split(" › ")[0]} <ChevronRightIcon className="size-3" />{" "}
                          {entry.label.split(" › ")[1]}
                        </>
                      ) : (
                        entry.label
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </AppShellCommandDialog>
  )
}

/** App-wide shortcuts, listed in the "?" dialog. Page-level ones register the same way. */
function ShellHotkeys({ navigate }: { navigate: (to: string) => void }) {
  const { setSearchOpen } = useAppShell()
  const { theme, setTheme } = useTheme()
  useHotkey("mod+k", () => setSearchOpen(true), { label: "Open command menu", allowInInput: true })
  useHotkey("mod+j", () => setTheme(theme === "dark" ? "light" : "dark"), { label: "Toggle dark mode" })
  useHotkey("g d", () => navigate("/"), { label: "Go to dashboard", group: "Navigate" })
  useHotkey("g t", () => navigate("/projects/tasks"), { label: "Go to tasks", group: "Navigate" })
  useHotkey("g k", () => navigate("/projects/board"), { label: "Go to kanban", group: "Navigate" })
  useHotkey("g c", () => navigate("/projects/calendar"), { label: "Go to calendar", group: "Navigate" })
  useHotkey("g i", () => navigate("/import"), { label: "Go to import", group: "Navigate" })
  useHotkey("g s", () => navigate("/settings"), { label: "Go to settings", group: "Navigate" })
  return null
}

function ShortcutsMenuItem() {
  const { setOpen } = useHotkeysDialog()
  return (
    <DropdownMenuItem value="shortcuts" onSelect={() => setOpen(true)}>
      <KeyboardIcon /> Keyboard shortcuts
    </DropdownMenuItem>
  )
}

export function AppShellDemo({
  children,
  fixed = false,
  headerStart,
}: {
  children: React.ReactNode
  fixed?: boolean
  /** Rendered in the header before the search box, e.g. a page's top nav. */
  headerStart?: React.ReactNode
}) {
  const { path, navigate } = useHashRoute()
  const { theme, setTheme } = useTheme()

  return (
    <HotkeysProvider>
      <AppShell searchShortcut={false}>
        <ShellHotkeys navigate={navigate} />
        <HotkeysDialog />
        <AppShellSkipLink />
        <AppShellSidebar>
          <AppShellSidebarHeader>
            <TeamSwitcher />
          </AppShellSidebarHeader>
          <AppShellSidebarContent>
            {navGroups.map((group) => (
              <AppShellNav key={group.title}>
                <AppShellNavLabel>{group.title}</AppShellNavLabel>
                <AppShellNavList>
                  {group.items.map((item) =>
                    !item.items ? (
                      <AppShellNavItem key={item.title}>
                        <AppShellNavLink active={isActive(path, item.url)} tooltip={item.title}>
                          <a href={`#${item.url}`}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item.badge && <AppShellNavBadge>{item.badge}</AppShellNavBadge>}
                          </a>
                        </AppShellNavLink>
                      </AppShellNavItem>
                    ) : (
                      <AppShellNavCollapsible
                        key={item.title}
                        tooltip={item.title}
                        active={isActive(path, undefined, item.items, true)}
                        trigger={
                          <>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item.badge && <AppShellNavBadge>{item.badge}</AppShellNavBadge>}
                          </>
                        }
                        menu={item.items.map((sub) => (
                          <AppShellNavMenuLink key={sub.url} value={sub.url} active={isActive(path, sub.url)}>
                            <a href={`#${sub.url}`}>
                              {sub.icon && <sub.icon />}
                              <span className="max-w-52 text-wrap">{sub.title}</span>
                              {sub.badge && <span className="ms-auto text-xs">{sub.badge}</span>}
                            </a>
                          </AppShellNavMenuLink>
                        ))}
                      >
                        {item.items.map((sub) => (
                          <AppShellNavSubItem key={sub.url}>
                            <AppShellNavSubLink active={isActive(path, sub.url)}>
                              <a href={`#${sub.url}`}>
                                {sub.icon && <sub.icon />}
                                <span>{sub.title}</span>
                                {sub.badge && <AppShellNavBadge>{sub.badge}</AppShellNavBadge>}
                              </a>
                            </AppShellNavSubLink>
                          </AppShellNavSubItem>
                        ))}
                      </AppShellNavCollapsible>
                    )
                  )}
                </AppShellNavList>
              </AppShellNav>
            ))}
          </AppShellSidebarContent>
          <AppShellSidebarFooter>
            <NavUser navigate={navigate} />
          </AppShellSidebarFooter>
        </AppShellSidebar>

        <AppShellContent>
          <AppShellHeader fixed={!fixed}>
            {headerStart}
            <AppShellHeaderActions>
              <AppShellSearch />
              <NotificationsMenu navigate={navigate} />
              <AppShellThemeToggle theme={(theme as Theme) ?? "system"} onThemeChange={setTheme} />
              <DropdownMenu positioning={{ placement: "bottom-end" }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-8 rounded-full">
                    <Avatar className="size-8">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm leading-none font-medium">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem value="profile" onSelect={() => navigate("/settings")}>
                      Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem value="billing" onSelect={() => navigate("/settings")}>
                      Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem value="settings" onSelect={() => navigate("/settings")}>
                      Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem value="sign-out" variant="destructive">
                      Sign out <DropdownMenuShortcut className="text-current">⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AppShellHeaderActions>
          </AppShellHeader>
          <AppShellMain fixed={fixed}>{children}</AppShellMain>
        </AppShellContent>

        <CommandMenu navigate={navigate} />
      </AppShell>
    </HotkeysProvider>
  )
}
