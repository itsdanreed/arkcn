"use client"

import * as React from "react"
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CommandDialog } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

type SidebarVariant = "sidebar" | "floating" | "inset"
type SidebarCollapsible = "offcanvas" | "icon" | "none"

type AppShellContextValue = {
  variant: SidebarVariant
  setVariant: (variant: SidebarVariant) => void
  collapsible: SidebarCollapsible
  setCollapsible: (collapsible: SidebarCollapsible) => void
  searchOpen: boolean
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null)

function useAppShell() {
  const ctx = React.useContext(AppShellContext)
  if (!ctx) throw new Error("useAppShell must be used within <AppShell>")
  return ctx
}

/**
 * Root of the shell. Owns the sidebar open state (via `SidebarProvider`), the
 * sidebar variant and collapse mode, and the global search open state with its
 * Cmd/Ctrl+K shortcut. Routing, theming, and data are the consumer's.
 */
function AppShell({
  variant: variantProp,
  defaultVariant = "inset",
  onVariantChange,
  collapsible: collapsibleProp,
  defaultCollapsible = "icon",
  onCollapsibleChange,
  searchShortcut = true,
  children,
  ...sidebarProviderProps
}: Omit<React.ComponentProps<typeof SidebarProvider>, "children"> & {
  variant?: SidebarVariant
  defaultVariant?: SidebarVariant
  onVariantChange?: (variant: SidebarVariant) => void
  collapsible?: SidebarCollapsible
  defaultCollapsible?: SidebarCollapsible
  onCollapsibleChange?: (collapsible: SidebarCollapsible) => void
  /** Toggle the search dialog with Cmd/Ctrl+K. */
  searchShortcut?: boolean
  children?: React.ReactNode
}) {
  const [variantState, setVariantState] = React.useState(defaultVariant)
  const [collapsibleState, setCollapsibleState] = React.useState(defaultCollapsible)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const variant = variantProp ?? variantState
  const collapsible = collapsibleProp ?? collapsibleState

  React.useEffect(() => {
    if (!searchShortcut) return
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [searchShortcut])

  const ctx = React.useMemo<AppShellContextValue>(
    () => ({
      variant,
      setVariant: (next) => {
        if (variantProp === undefined) setVariantState(next)
        onVariantChange?.(next)
      },
      collapsible,
      setCollapsible: (next) => {
        if (collapsibleProp === undefined) setCollapsibleState(next)
        onCollapsibleChange?.(next)
      },
      searchOpen,
      setSearchOpen,
    }),
    [variant, variantProp, onVariantChange, collapsible, collapsibleProp, onCollapsibleChange, searchOpen]
  )

  return (
    <AppShellContext.Provider value={ctx}>
      <SidebarProvider {...sidebarProviderProps}>{children}</SidebarProvider>
    </AppShellContext.Provider>
  )
}

function AppShellSkipLink({
  className,
  href = "#content",
  children = "Skip to main content",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="app-shell-skip-link"
      href={href}
      className={cn(
        "fixed inset-s-44 z-999 -translate-y-52 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground opacity-95 shadow-sm transition focus:translate-y-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

function AppShellSidebar({ variant, collapsible, children, ...props }: React.ComponentProps<typeof Sidebar>) {
  const shell = useAppShell()
  return (
    <Sidebar
      data-slot="app-shell-sidebar"
      variant={variant ?? shell.variant}
      collapsible={collapsible ?? shell.collapsible}
      {...props}
    >
      {children}
      <SidebarRail />
    </Sidebar>
  )
}

/* Brand / team switcher trigger ------------------------------------------- */

function AppShellBrand({ className, ...props }: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          data-slot="app-shell-brand"
          size="lg"
          className={cn("data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground", className)}
          {...props}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppShellBrandLogo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-brand-logo"
      className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function AppShellBrandText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-brand-text"
      className={cn("grid flex-1 text-start text-sm/tight", className)}
      {...props}
    />
  )
}

function AppShellBrandTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="app-shell-brand-title" className={cn("truncate font-semibold", className)} {...props} />
}

function AppShellBrandDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="app-shell-brand-description" className={cn("truncate text-xs", className)} {...props} />
}

function AppShellBrandChevron({ className, ...props }: React.ComponentProps<typeof ChevronsUpDownIcon>) {
  return <ChevronsUpDownIcon data-slot="app-shell-brand-chevron" className={cn("ms-auto", className)} {...props} />
}

/* Navigation --------------------------------------------------------------- */

function AppShellNav({ ...props }: React.ComponentProps<typeof SidebarGroup>) {
  return <SidebarGroup data-slot="app-shell-nav" {...props} />
}

function AppShellNavLabel({ ...props }: React.ComponentProps<typeof SidebarGroupLabel>) {
  return <SidebarGroupLabel data-slot="app-shell-nav-label" {...props} />
}

function AppShellNavList({ ...props }: React.ComponentProps<typeof SidebarMenu>) {
  return <SidebarMenu data-slot="app-shell-nav-list" {...props} />
}

function AppShellNavItem({ ...props }: React.ComponentProps<typeof SidebarMenuItem>) {
  return <SidebarMenuItem data-slot="app-shell-nav-item" {...props} />
}

/**
 * A top-level navigation link. Pass the link element as the child with
 * `asChild` (default) so any router's link works. `active` marks the current
 * route; `tooltip` shows when the sidebar is collapsed to icons.
 */
function AppShellNavLink({
  active = false,
  asChild = true,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuButton>, "isActive"> & {
  active?: boolean
}) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuButton
      data-slot="app-shell-nav-link"
      asChild={asChild}
      isActive={active}
      onClick={(event) => {
        onClick?.(event)
        setOpenMobile(false)
      }}
      {...props}
    />
  )
}

function AppShellNavBadge({ className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-slot="app-shell-nav-badge"
      className={cn("ms-auto rounded-full px-1 py-0 text-xs", className)}
      {...props}
    />
  )
}

/**
 * A navigation item with children. Expanded sidebar: a collapsible sub-list.
 * Icon-collapsed sidebar on desktop: a flyout menu. Supply `trigger` for the
 * button content and `menu` for the flyout items; `children` is the sub-list.
 */
function AppShellNavCollapsible({
  active = false,
  defaultOpen,
  tooltip,
  trigger,
  menu,
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuItem> & {
  active?: boolean
  defaultOpen?: boolean
  tooltip?: string
  trigger: React.ReactNode
  /** Rendered inside the flyout when the sidebar is collapsed to icons. */
  menu?: React.ReactNode
}) {
  const { state, isMobile } = useSidebar()

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem data-slot="app-shell-nav-collapsible" {...props}>
        <DropdownMenu positioning={{ placement: "right-start", gutter: 4 }}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={tooltip} isActive={active}>
              {trigger}
              <ChevronRightIcon className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-slot="app-shell-nav-flyout">
            <DropdownMenuGroup>
              {tooltip && (
                <>
                  <DropdownMenuLabel>{tooltip}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              {menu}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      defaultOpen={defaultOpen ?? active}
      className="group/collapsible"
      unmountOnExit={false}
      lazyMount={false}
    >
      <SidebarMenuItem data-slot="app-shell-nav-collapsible" {...props}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={tooltip} isActive={active}>
            {trigger}
            <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub data-slot="app-shell-nav-sublist">{children}</SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function AppShellNavSubItem({ ...props }: React.ComponentProps<typeof SidebarMenuSubItem>) {
  return <SidebarMenuSubItem data-slot="app-shell-nav-subitem" {...props} />
}

function AppShellNavSubLink({
  active = false,
  asChild = true,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuSubButton>, "isActive"> & { active?: boolean }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuSubButton
      data-slot="app-shell-nav-sublink"
      asChild={asChild}
      isActive={active}
      onClick={(event) => {
        onClick?.(event)
        setOpenMobile(false)
      }}
      {...props}
    />
  )
}

/** A flyout menu entry for the icon-collapsed state. */
function AppShellNavMenuLink({
  active = false,
  className,
  asChild = true,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & { active?: boolean }) {
  return (
    <DropdownMenuItem
      data-slot="app-shell-nav-menu-link"
      asChild={asChild}
      className={cn(active && "bg-secondary", className)}
      {...props}
    />
  )
}

/* User footer trigger ------------------------------------------------------ */

function AppShellUser({ className, ...props }: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          data-slot="app-shell-user"
          size="lg"
          className={cn("data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground", className)}
          {...props}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppShellUserAvatar({
  src,
  alt,
  fallback,
  className,
  ...props
}: React.ComponentProps<typeof Avatar> & { src?: string; alt?: string; fallback: React.ReactNode }) {
  return (
    <Avatar data-slot="app-shell-user-avatar" className={cn("rounded-lg", className)} {...props}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
    </Avatar>
  )
}

function AppShellUserText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="app-shell-user-text" className={cn("grid flex-1 text-start text-sm/tight", className)} {...props} />
  )
}

function AppShellUserName({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="app-shell-user-name" className={cn("truncate font-semibold", className)} {...props} />
}

function AppShellUserEmail({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="app-shell-user-email" className={cn("truncate text-xs", className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Content area: header, main                                                */
/* -------------------------------------------------------------------------- */

function AppShellContent({ className, ...props }: React.ComponentProps<typeof SidebarInset>) {
  return (
    <SidebarInset
      data-slot="app-shell-content"
      id="content"
      className={cn(
        "@container/content",
        "has-data-[layout=fixed]:h-svh",
        "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
        className
      )}
      {...props}
    />
  )
}

function AppShellHeader({
  className,
  fixed = false,
  children,
  ...props
}: React.ComponentProps<"header"> & { fixed?: boolean }) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    if (!fixed) return
    const onScroll = () => setScrolled((document.body.scrollTop || document.documentElement.scrollTop) > 10)
    onScroll()
    document.addEventListener("scroll", onScroll, { passive: true })
    return () => document.removeEventListener("scroll", onScroll)
  }, [fixed])
  return (
    <header
      data-slot="app-shell-header"
      data-fixed={fixed ? "" : undefined}
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        // Solid background; the top corners follow the inset card's radius so the
        // header never squares off the rounded content area.
        "z-50 h-16 rounded-t-[inherit] bg-background",
        fixed && "peer/header sticky top-0 w-[inherit]",
        fixed && scrolled ? "shadow-sm" : "shadow-none",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative flex h-full items-center gap-3 p-4 sm:gap-4",
          fixed &&
            scrolled &&
            "after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-background/60 after:backdrop-blur-lg"
        )}
      >
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        {children}
      </div>
    </header>
  )
}

function AppShellHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-header-actions"
      className={cn("ms-auto flex items-center gap-3 sm:gap-4", className)}
      {...props}
    />
  )
}

function AppShellMain({
  className,
  fixed = false,
  fluid = false,
  ...props
}: React.ComponentProps<"main"> & { fixed?: boolean; fluid?: boolean }) {
  return (
    <main
      data-slot="app-shell-main"
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "px-4 py-6",
        fixed && "flex grow flex-col overflow-hidden",
        !fluid && "@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl",
        className
      )}
      {...props}
    />
  )
}

/* Top nav (secondary, in the header) --------------------------------------- */

function AppShellTopNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="app-shell-top-nav"
      className={cn("hidden items-center gap-4 lg:flex xl:gap-6", className)}
      {...props}
    />
  )
}

function AppShellTopNavLink({ active = false, className, ...props }: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      data-slot="app-shell-top-nav-link"
      data-active={active ? "" : undefined}
      className={cn(
        "text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** The small-screen counterpart of `AppShellTopNav`: the same links in a menu. */
function AppShellTopNavMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenu> & { className?: string }) {
  return (
    <DropdownMenu positioning={{ placement: "bottom-start" }} {...props}>
      <DropdownMenuTrigger asChild>
        <Button
          data-slot="app-shell-top-nav-menu-trigger"
          size="icon"
          variant="outline"
          className={cn("md:size-7 lg:hidden", className)}
        >
          <MenuIcon />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/*  Search and command menu                                                   */
/* -------------------------------------------------------------------------- */

function AppShellSearch({
  className,
  placeholder = "Search",
  onClick,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { placeholder?: string }) {
  const shell = useAppShell()
  return (
    <Button
      data-slot="app-shell-search"
      variant="outline"
      asChild={asChild}
      className={cn(
        "group relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
        className
      )}
      aria-keyshortcuts="Meta+K Control+K"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) shell.setSearchOpen(true)
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <SearchIcon aria-hidden className="absolute inset-s-1.5 top-1/2 size-4 -translate-y-1/2" />
              <span className="ms-4">{placeholder}</span>
              <Kbd className="pointer-events-none absolute inset-e-1.5 top-1.5 hidden sm:flex">⌘K</Kbd>
            </>
          ))}
    </Button>
  )
}

/** A `CommandDialog` bound to the shell's search state. */
function AppShellCommandDialog({
  ...props
}: Omit<React.ComponentProps<typeof CommandDialog>, "open" | "onOpenChange">) {
  const shell = useAppShell()
  return <CommandDialog open={shell.searchOpen} onOpenChange={({ open }) => shell.setSearchOpen(open)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Notifications                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A header notifications popover. Data-agnostic: the consumer renders the
 * items and owns read state; pass `count` to the trigger for the unread badge.
 */
function AppShellNotifications({ positioning, ...props }: React.ComponentProps<typeof Popover>) {
  return (
    <Popover
      data-slot="app-shell-notifications"
      positioning={{ placement: "bottom-end", gutter: 8, ...positioning }}
      {...props}
    />
  )
}

function AppShellNotificationsTrigger({
  count = 0,
  max = 99,
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Unread count shown as a badge; hidden when 0. */
  count?: number
  max?: number
}) {
  const label = count > max ? `${max}+` : String(count)
  return (
    <PopoverTrigger asChild>
      <Button
        data-slot="app-shell-notifications-trigger"
        data-unread={count > 0 ? "" : undefined}
        variant="ghost"
        size="icon-lg"
        asChild={asChild}
        className={cn("relative scale-95 rounded-full", className)}
        aria-label={count > 0 ? `Notifications, ${label} unread` : "Notifications"}
        {...props}
      >
        {asChild ? children : (children ?? <BellIcon className="size-[1.2rem]" />)}
        {!asChild && count > 0 && (
          <span
            data-slot="app-shell-notifications-badge"
            aria-hidden
            className="absolute inset-e-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-medium text-white ring-2 ring-background"
          >
            {label}
          </span>
        )}
      </Button>
    </PopoverTrigger>
  )
}

function AppShellNotificationsContent({ className, ...props }: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="app-shell-notifications-content"
      className={cn("w-80 gap-0 p-0 sm:w-96", className)}
      {...props}
    />
  )
}

function AppShellNotificationsHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-notifications-header"
      className={cn("flex items-center justify-between gap-2 border-b px-3.5 py-2.5", className)}
      {...props}
    />
  )
}

function AppShellNotificationsTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="app-shell-notifications-title" className={cn("text-sm font-semibold", className)} {...props} />
}

/** A small text action for the header or footer, e.g. "Mark all as read". */
function AppShellNotificationsActionTrigger({
  className,
  variant = "link",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="app-shell-notifications-action-trigger"
      variant={variant}
      size={size}
      className={cn("h-auto p-0 text-xs text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  )
}

function AppShellNotificationsList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="app-shell-notifications-list"
      className={cn("no-scrollbar flex max-h-96 flex-col gap-0.5 overflow-y-auto p-1", className)}
      {...props}
    />
  )
}

function AppShellNotificationItem({
  unread,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"li"> & {
  unread?: boolean
  /** Render the item's child (e.g. an anchor or button) as the interactive surface. */
  asChild?: boolean
}) {
  const itemClassName = cn(
    "group/notification relative flex w-full cursor-default gap-3 rounded-md px-2.5 py-2 text-start text-sm outline-hidden transition-colors select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-unread:bg-primary/5 dark:data-unread:bg-primary/10",
    className
  )
  const inner =
    asChild && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          "data-slot": "app-shell-notification-item-surface",
          "data-unread": unread ? "" : undefined,
          className: cn(itemClassName, (children as React.ReactElement<{ className?: string }>).props.className),
        })
      : children
  return (
    <li
      data-slot="app-shell-notification-item"
      data-unread={unread ? "" : undefined}
      className={asChild ? "flex" : itemClassName}
      {...props}
    >
      {inner}
    </li>
  )
}

function AppShellNotificationItemIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-notification-item-icon"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function AppShellNotificationItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-notification-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="app-shell-notification-item-title"
      className={cn("truncate leading-tight font-medium group-data-unread/notification:text-foreground", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="app-shell-notification-item-description"
      className={cn("line-clamp-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="app-shell-notification-item-time"
      className={cn("text-[11px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** The unread dot; renders only inside an unread item. */
function AppShellNotificationItemIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="app-shell-notification-item-indicator"
      aria-hidden
      className={cn(
        "mt-1.5 hidden size-2 shrink-0 rounded-full bg-primary group-data-unread/notification:block",
        className
      )}
      {...props}
    />
  )
}

function AppShellNotificationsEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-notifications-empty"
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground [&_svg]:mb-1 [&_svg]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AppShellNotificationsFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-notifications-footer"
      className={cn("flex items-center justify-center border-t px-3.5 py-2", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Theme toggle                                                              */
/* -------------------------------------------------------------------------- */

type Theme = "light" | "dark" | "system"

function AppShellThemeToggle({
  theme,
  onThemeChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onChange"> & {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}) {
  return (
    <DropdownMenu positioning={{ placement: "bottom-end" }}>
      <DropdownMenuTrigger asChild>
        <Button
          data-slot="app-shell-theme-toggle"
          variant="ghost"
          size="icon-lg"
          className={cn("scale-95 rounded-full", className)}
          {...props}
        >
          <SunIcon className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(["light", "dark", "system"] as const).map((option) => (
          <DropdownMenuItem key={option} value={option} onSelect={() => onThemeChange(option)}>
            <span className="capitalize">{option}</span>
            <CheckIcon className={cn("ms-auto size-3.5", theme !== option && "invisible")} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
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
  AppShellNotificationItem,
  AppShellNotificationItemContent,
  AppShellNotificationItemDescription,
  AppShellNotificationItemIcon,
  AppShellNotificationItemIndicator,
  AppShellNotificationItemTime,
  AppShellNotificationItemTitle,
  AppShellNotifications,
  AppShellNotificationsActionTrigger,
  AppShellNotificationsContent,
  AppShellNotificationsEmpty,
  AppShellNotificationsFooter,
  AppShellNotificationsHeader,
  AppShellNotificationsList,
  AppShellNotificationsTitle,
  AppShellNotificationsTrigger,
  AppShellSearch,
  AppShellSidebar,
  AppShellSkipLink,
  AppShellThemeToggle,
  AppShellTopNav,
  AppShellTopNavLink,
  AppShellTopNavMenu,
  AppShellUser,
  AppShellUserAvatar,
  AppShellUserEmail,
  AppShellUserName,
  AppShellUserText,
  SidebarContent as AppShellSidebarContent,
  SidebarFooter as AppShellSidebarFooter,
  SidebarHeader as AppShellSidebarHeader,
  useAppShell,
  type SidebarCollapsible,
  type SidebarVariant,
  type Theme,
}
