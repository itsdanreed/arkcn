"use client"

import { ark, useLocaleContext } from "@ark-ui/react"
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
import { cn } from "../../lib/utils"

import { Avatar } from "./avatar"
import { Badge } from "./badge"
import { Button, buttonVariants } from "./button"
import { Collapsible } from "./collapsible"
import { Command } from "./command"
import { DropdownMenu } from "./dropdown-menu"
import { Kbd } from "./kbd"
import { Popover, usePopoverContext } from "./popover"
import { Separator } from "./separator"
import { Sidebar, useSidebar } from "./sidebar"

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

type SidebarVariant = "sidebar" | "floating" | "inset"
type SidebarCollapsible = "offcanvas" | "icon" | "none"

type AppShellContextValue = {
  variant: SidebarVariant
  setVariant: (variant: SidebarVariant) => void
  /** Controlled sidebar collapse mode: `offcanvas`, `icon`, or `none`. */
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
function AppShellRoot({
  variant: variantProp,
  defaultVariant = "inset",
  onVariantChange,
  collapsible: collapsibleProp,
  defaultCollapsible = "icon",
  onCollapsibleChange,
  searchShortcut = true,
  children,
  ...sidebarProviderProps
}: AppShellRootProps) {
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
      <Sidebar.Provider {...sidebarProviderProps}>{children}</Sidebar.Provider>
    </AppShellContext.Provider>
  )
}

function AppShellSkipLink({
  className,
  href = "#content",
  children = "Skip to main content",
  ...props
}: AppShellSkipLinkProps) {
  return (
    <ark.a
      data-slot="app-shell-skip-link"
      href={href}
      className={cn(
        buttonVariants({ variant: "default" }),
        "fixed inset-s-3 top-3 z-999 -translate-y-[calc(100%+1rem)] focus:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </ark.a>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

function AppShellSidebar({ variant, collapsible, children, ...props }: AppShellSidebarProps) {
  const shell = useAppShell()
  return (
    <Sidebar.Root
      data-slot="app-shell-sidebar"
      variant={variant ?? shell.variant}
      collapsible={collapsible ?? shell.collapsible}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          <Sidebar.Rail />
        </>
      )}
    </Sidebar.Root>
  )
}

/* Brand / team switcher trigger ------------------------------------------- */

function AppShellBrand({ className, ...props }: AppShellBrandProps) {
  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          data-slot="app-shell-brand"
          size="lg"
          className={cn("data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground", className)}
          {...props}
        />
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  )
}

function AppShellBrandLogo({ className, ...props }: AppShellBrandLogoProps) {
  return (
    <ark.div
      data-slot="app-shell-brand-logo"
      className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function AppShellBrandText({ className, ...props }: AppShellBrandTextProps) {
  return (
    <ark.div
      data-slot="app-shell-brand-text"
      className={cn("grid flex-1 text-start text-sm/tight", className)}
      {...props}
    />
  )
}

function AppShellBrandTitle({ className, ...props }: AppShellBrandTitleProps) {
  return <ark.span data-slot="app-shell-brand-title" className={cn("truncate font-medium", className)} {...props} />
}

function AppShellBrandDescription({ className, ...props }: AppShellBrandDescriptionProps) {
  return <ark.span data-slot="app-shell-brand-description" className={cn("truncate text-xs", className)} {...props} />
}

function AppShellBrandChevron({ className, asChild, children, ...props }: AppShellBrandChevronProps) {
  return (
    <ark.svg asChild data-slot="app-shell-brand-chevron" className={cn("ms-auto", className)} {...props}>
      {asChild ? children : <ChevronsUpDownIcon />}
    </ark.svg>
  )
}

/* Navigation --------------------------------------------------------------- */

function AppShellNav({ ...props }: AppShellNavProps) {
  return <Sidebar.Group data-slot="app-shell-nav" {...props} />
}

function AppShellNavLabel({ ...props }: AppShellNavLabelProps) {
  return <Sidebar.GroupLabel data-slot="app-shell-nav-label" {...props} />
}

function AppShellNavList({ ...props }: AppShellNavListProps) {
  return <Sidebar.Menu data-slot="app-shell-nav-list" {...props} />
}

function AppShellNavItem({ ...props }: AppShellNavItemProps) {
  return <Sidebar.MenuItem data-slot="app-shell-nav-item" {...props} />
}

/**
 * A top-level navigation link. Pass the link element as the child with
 * `asChild` (default) so any router's link works. `active` marks the current
 * route; `tooltip` shows when the sidebar is collapsed to icons.
 */
function AppShellNavLink({ active = false, asChild = true, onClick, ...props }: AppShellNavLinkProps) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar.MenuButton
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

function AppShellNavBadge({ className, ...props }: AppShellNavBadgeProps) {
  return (
    <Badge.Root
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
}: AppShellNavCollapsibleProps) {
  const { state, isMobile } = useSidebar()
  const { dir } = useLocaleContext()

  if (state === "collapsed" && !isMobile) {
    return (
      <Sidebar.MenuItem data-slot="app-shell-nav-collapsible" {...props}>
        <DropdownMenu.Root positioning={{ placement: dir === "rtl" ? "left-start" : "right-start", gutter: 4 }}>
          <DropdownMenu.Trigger asChild>
            <Sidebar.MenuButton tooltip={tooltip} isActive={active}>
              {trigger}
              <ChevronRightIcon className="ms-auto rtl:rotate-180" />
            </Sidebar.MenuButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content data-slot="app-shell-nav-flyout">
            <DropdownMenu.ItemGroup>
              {tooltip && (
                <>
                  <DropdownMenu.ItemGroupLabel>{tooltip}</DropdownMenu.ItemGroupLabel>
                  <DropdownMenu.Separator />
                </>
              )}
              {menu}
            </DropdownMenu.ItemGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    )
  }

  return (
    <Collapsible.Root
      defaultOpen={defaultOpen ?? active}
      className="group/collapsible"
      unmountOnExit={false}
      lazyMount={false}
    >
      <Sidebar.MenuItem data-slot="app-shell-nav-collapsible" {...props}>
        <Collapsible.Trigger asChild>
          <Sidebar.MenuButton tooltip={tooltip} isActive={active}>
            {trigger}
            <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </Sidebar.MenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Sidebar.MenuSub data-slot="app-shell-nav-sublist">{children}</Sidebar.MenuSub>
        </Collapsible.Content>
      </Sidebar.MenuItem>
    </Collapsible.Root>
  )
}

function AppShellNavSubItem({ ...props }: AppShellNavSubItemProps) {
  return <Sidebar.MenuSubItem data-slot="app-shell-nav-subitem" {...props} />
}

function AppShellNavSubLink({ active = false, asChild = true, onClick, ...props }: AppShellNavSubLinkProps) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar.MenuSubButton
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
function AppShellNavMenuLink({ active = false, className, asChild = true, ...props }: AppShellNavMenuLinkProps) {
  return (
    <DropdownMenu.Item
      data-slot="app-shell-nav-menu-link"
      asChild={asChild}
      className={cn(active && "bg-secondary", className)}
      {...props}
    />
  )
}

/* User footer trigger ------------------------------------------------------ */

function AppShellUser({ className, ...props }: AppShellUserProps) {
  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          data-slot="app-shell-user"
          size="lg"
          className={cn("data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground", className)}
          {...props}
        />
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  )
}

function AppShellUserAvatar({ src, alt, fallback, className, ...props }: AppShellUserAvatarProps) {
  return (
    <Avatar.Root data-slot="app-shell-user-avatar" className={className} {...props}>
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {src && <Avatar.Image src={src} alt={alt} />}
          <Avatar.Fallback>{fallback}</Avatar.Fallback>
        </>
      )}
    </Avatar.Root>
  )
}

function AppShellUserText({ className, ...props }: AppShellUserTextProps) {
  return (
    <ark.div
      data-slot="app-shell-user-text"
      className={cn("grid flex-1 text-start text-sm/tight", className)}
      {...props}
    />
  )
}

function AppShellUserName({ className, ...props }: AppShellUserNameProps) {
  return <ark.span data-slot="app-shell-user-name" className={cn("truncate font-medium", className)} {...props} />
}

function AppShellUserEmail({ className, ...props }: AppShellUserEmailProps) {
  return <ark.span data-slot="app-shell-user-email" className={cn("truncate text-xs", className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Content area: header, main                                                */
/* -------------------------------------------------------------------------- */

function AppShellContent({ className, asChild, children, ...props }: AppShellContentProps) {
  return (
    <Sidebar.Inset
      asChild
      data-slot="app-shell-content"
      className={cn(
        "@container/content min-h-0 min-w-0",
        "has-data-[layout=fixed]:h-svh",
        "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
        className
      )}
      {...props}
    >
      {asChild ? children : <ark.div>{children}</ark.div>}
    </Sidebar.Inset>
  )
}

function AppShellHeader({ className, fixed = false, children, ref, ...props }: AppShellHeaderProps) {
  const headerRef = React.useRef<HTMLElement>(null)
  React.useImperativeHandle(ref, () => headerRef.current!, [])
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    if (!fixed) {
      setScrolled(false)
      return
    }
    const header = headerRef.current
    if (!header) return
    const doc = header.ownerDocument
    // Observe the shell's main scroller and ancestors, not unrelated nested lists
    // or portalled menus. Scroll does not bubble, so use a capture listener.
    const targets = new Set<Element>()
    const main = header.closest('[data-slot="app-shell-content"]')?.querySelector('[data-slot="app-shell-main"]')
    if (main) targets.add(main)
    for (let parent = header.parentElement; parent; parent = parent.parentElement) targets.add(parent)
    if (doc.scrollingElement) targets.add(doc.scrollingElement)
    const update = () => setScrolled([...targets].some((target) => target.scrollTop > 10))
    const onScroll = (event: Event) => {
      if (event.target === doc || targets.has(event.target as Element)) update()
    }
    update()
    doc.addEventListener("scroll", onScroll, { passive: true, capture: true })
    return () => doc.removeEventListener("scroll", onScroll, true)
  }, [fixed])
  return (
    <ark.header
      ref={headerRef}
      data-slot="app-shell-header"
      data-fixed={fixed ? "" : undefined}
      data-scrolled={fixed && scrolled ? "" : undefined}
      className={cn(
        "z-50 h-16 shrink-0 rounded-t-[inherit] bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        fixed && "peer/header sticky top-0 w-[inherit]",
        fixed && scrolled ? "shadow-sm" : "shadow-none",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <div className="relative flex h-full items-center gap-2 px-4">
          <Sidebar.Trigger className="-ms-1" />
          <Separator.Root orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
          {children}
        </div>
      )}
    </ark.header>
  )
}

function AppShellHeaderActions({ className, ...props }: AppShellHeaderActionsProps) {
  return (
    <ark.div
      data-slot="app-shell-header-actions"
      className={cn("ms-auto flex items-center gap-3 sm:gap-4", className)}
      {...props}
    />
  )
}

function AppShellMain({ className, fixed = false, fluid = false, ...props }: AppShellMainProps) {
  return (
    <ark.main
      data-slot="app-shell-main"
      id="content"
      tabIndex={-1}
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "p-4 pt-0 outline-hidden",
        fixed && "flex min-h-0 flex-1 flex-col overflow-y-auto",
        !fluid && "@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl",
        className
      )}
      {...props}
    />
  )
}

/* Top nav (secondary, in the header) --------------------------------------- */

function AppShellTopNav({ className, ...props }: AppShellTopNavProps) {
  return (
    <ark.nav data-slot="app-shell-top-nav" className={cn("hidden items-center gap-0 lg:flex", className)} {...props} />
  )
}

function AppShellTopNavLink({ active = false, className, ...props }: AppShellTopNavLinkProps) {
  return (
    <ark.a
      data-slot="app-shell-top-nav-link"
      aria-current={active ? "page" : undefined}
      data-active={active ? "" : undefined}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "relative px-2.5", className)}
      {...props}
    />
  )
}

/** The small-screen counterpart of `AppShellTopNav`: the same links in a menu. */
function AppShellTopNavMenu({ className, children, ...props }: AppShellTopNavMenuProps) {
  return (
    <DropdownMenu.Root positioning={{ placement: "bottom-start" }} {...props}>
      <DropdownMenu.Trigger asChild>
        <Button
          data-slot="app-shell-top-nav-menu-trigger"
          size="icon"
          variant="outline"
          className={cn("lg:hidden", className)}
        >
          <MenuIcon />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>{children}</DropdownMenu.Content>
    </DropdownMenu.Root>
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
}: AppShellSearchProps) {
  const shell = useAppShell()
  return (
    <Button
      data-slot="app-shell-search"
      variant="outline"
      asChild={asChild}
      className={cn(
        "w-full min-w-0 flex-1 justify-start font-normal text-muted-foreground sm:w-40 md:flex-none lg:w-52 xl:w-64",
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
              <SearchIcon aria-hidden />
              <span className="truncate">{placeholder}</span>
              <Kbd.Root className="ms-auto hidden sm:flex">⌘K</Kbd.Root>
            </>
          ))}
    </Button>
  )
}

/** A `CommandDialog` bound to the shell's search state. */
function AppShellCommandDialog({ ...props }: AppShellCommandDialogProps) {
  const shell = useAppShell()
  return <Command.Dialog open={shell.searchOpen} onOpenChange={({ open }) => shell.setSearchOpen(open)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Notifications                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A header notifications popover. Data-agnostic: the consumer renders the
 * items and owns read state; pass `count` to the trigger for the unread badge.
 */
function AppShellNotifications({ positioning, ...props }: AppShellNotificationsProps) {
  return (
    <Popover.Root
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
}: AppShellNotificationsTriggerProps) {
  const label = count > max ? `${max}+` : String(count)
  return (
    <Popover.Trigger asChild>
      <Button
        data-slot="app-shell-notifications-trigger"
        data-unread={count > 0 ? "" : undefined}
        variant="ghost"
        size="icon"
        asChild={asChild}
        className={cn("relative", className)}
        aria-label={count > 0 ? `Notifications, ${label} unread` : "Notifications"}
        {...props}
      >
        {asChild ? children : (children ?? <BellIcon />)}
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
    </Popover.Trigger>
  )
}

function AppShellNotificationsContent({ className, ...props }: AppShellNotificationsContentProps) {
  const popover = usePopoverContext()
  return (
    <Popover.Content
      data-slot="app-shell-notifications-content"
      aria-labelledby={popover.getTitleProps().id}
      className={cn("w-80 gap-0 p-0 sm:w-96", className)}
      {...props}
    />
  )
}

function AppShellNotificationsHeader({ className, ...props }: AppShellNotificationsHeaderProps) {
  return (
    <ark.div
      data-slot="app-shell-notifications-header"
      className={cn("flex items-center justify-between gap-2 border-b px-3.5 py-2.5", className)}
      {...props}
    />
  )
}

function AppShellNotificationsTitle({ className, ...props }: AppShellNotificationsTitleProps) {
  return (
    <Popover.Title asChild>
      <ark.h3 data-slot="app-shell-notifications-title" className={cn("text-sm font-medium", className)} {...props} />
    </Popover.Title>
  )
}

/** A small text action for the header or footer, e.g. "Mark all as read". */
function AppShellNotificationsActionTrigger({
  className,
  variant = "link",
  size = "sm",
  ...props
}: AppShellNotificationsActionTriggerProps) {
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

function AppShellNotificationsList({ className, ...props }: AppShellNotificationsListProps) {
  return (
    <ark.ul
      data-slot="app-shell-notifications-list"
      className={cn("no-scrollbar flex max-h-96 flex-col gap-0.5 overflow-y-auto p-1", className)}
      {...props}
    />
  )
}

function AppShellNotificationItem({ unread, asChild, className, children, ...props }: AppShellNotificationItemProps) {
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
    <ark.li
      data-slot="app-shell-notification-item"
      data-unread={unread ? "" : undefined}
      className={asChild ? "flex" : itemClassName}
      {...props}
    >
      {inner}
    </ark.li>
  )
}

function AppShellNotificationItemIcon({ className, ...props }: AppShellNotificationItemIconProps) {
  return (
    <ark.div
      data-slot="app-shell-notification-item-icon"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function AppShellNotificationItemContent({ className, ...props }: AppShellNotificationItemContentProps) {
  return (
    <ark.div
      data-slot="app-shell-notification-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemTitle({ className, ...props }: AppShellNotificationItemTitleProps) {
  return (
    <ark.p
      data-slot="app-shell-notification-item-title"
      className={cn("truncate text-sm/snug font-medium group-data-unread/notification:text-foreground", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemDescription({ className, ...props }: AppShellNotificationItemDescriptionProps) {
  return (
    <ark.p
      data-slot="app-shell-notification-item-description"
      className={cn("line-clamp-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function AppShellNotificationItemTime({ className, ...props }: AppShellNotificationItemTimeProps) {
  return (
    <ark.time
      data-slot="app-shell-notification-item-time"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/** The unread dot; renders only inside an unread item. */
function AppShellNotificationItemIndicator({ className, ...props }: AppShellNotificationItemIndicatorProps) {
  return (
    <ark.span
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

function AppShellNotificationsEmpty({ className, ...props }: AppShellNotificationsEmptyProps) {
  return (
    <ark.div
      data-slot="app-shell-notifications-empty"
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground [&_svg]:mb-1 [&_svg]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AppShellNotificationsFooter({ className, ...props }: AppShellNotificationsFooterProps) {
  return (
    <ark.div
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

function AppShellThemeToggle({ theme, onThemeChange, className, ...props }: AppShellThemeToggleProps) {
  return (
    <DropdownMenu.Root positioning={{ placement: "bottom-end" }}>
      <DropdownMenu.Trigger asChild>
        <Button
          data-slot="app-shell-theme-toggle"
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          {...props}
        >
          {props.asChild ? (
            React.isValidElement(props.children) ? (
              props.children
            ) : null
          ) : (
            <>
              <SunIcon className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </>
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {(["light", "dark", "system"] as const).map((option) => (
          <DropdownMenu.Item key={option} value={option} onSelect={() => onThemeChange(option)}>
            <span className="capitalize">{option}</span>
            <CheckIcon className={cn("ms-auto size-3.5", theme !== option && "invisible")} />
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type AppShellRootProps = Omit<React.ComponentProps<typeof Sidebar.Provider>, "children"> & {
  variant?: SidebarVariant
  /** Initial sidebar variant when uncontrolled. */
  defaultVariant?: SidebarVariant
  /** Called when the sidebar variant changes. */
  onVariantChange?: (variant: SidebarVariant) => void
  /** Controlled sidebar collapse mode: `offcanvas`, `icon`, or `none`. */
  collapsible?: SidebarCollapsible
  /** Initial collapse mode when uncontrolled. */
  defaultCollapsible?: SidebarCollapsible
  /** Called when the collapse mode changes. */
  onCollapsibleChange?: (collapsible: SidebarCollapsible) => void
  /** Toggle the search dialog with Cmd/Ctrl+K. */
  searchShortcut?: boolean
  children?: React.ReactNode
}

type AppShellBrandProps = React.ComponentProps<typeof Sidebar.MenuButton>

type AppShellBrandChevronProps = React.ComponentProps<typeof ChevronsUpDownIcon> &
  Pick<React.ComponentProps<typeof ark.svg>, "asChild">

type AppShellBrandDescriptionProps = React.ComponentProps<typeof ark.span>

type AppShellBrandLogoProps = React.ComponentProps<typeof ark.div>

type AppShellBrandTextProps = React.ComponentProps<typeof ark.div>

type AppShellBrandTitleProps = React.ComponentProps<typeof ark.span>

type AppShellCommandDialogProps = Omit<React.ComponentProps<typeof Command.Dialog>, "open" | "onOpenChange">

type AppShellContentProps = React.ComponentProps<typeof Sidebar.Inset>

type AppShellHeaderProps = React.ComponentProps<typeof ark.header> & { fixed?: boolean }

type AppShellHeaderActionsProps = React.ComponentProps<typeof ark.div>

type AppShellMainProps = React.ComponentProps<typeof ark.main> & { fixed?: boolean; fluid?: boolean }

type AppShellNavProps = React.ComponentProps<typeof Sidebar.Group>

type AppShellNavBadgeProps = React.ComponentProps<typeof Badge.Root>

type AppShellNavCollapsibleProps = React.ComponentProps<typeof Sidebar.MenuItem> & {
  active?: boolean
  defaultOpen?: boolean
  tooltip?: string
  /** Element rendered as the trigger for the collapsible group. */
  trigger: React.ReactNode
  /** Rendered inside the flyout when the sidebar is collapsed to icons. */
  menu?: React.ReactNode
}

type AppShellNavItemProps = React.ComponentProps<typeof Sidebar.MenuItem>

type AppShellNavLabelProps = React.ComponentProps<typeof Sidebar.GroupLabel>

type AppShellNavLinkProps = Omit<React.ComponentProps<typeof Sidebar.MenuButton>, "isActive"> & {
  active?: boolean
}

type AppShellNavListProps = React.ComponentProps<typeof Sidebar.Menu>

type AppShellNavMenuLinkProps = React.ComponentProps<typeof DropdownMenu.Item> & { active?: boolean }

type AppShellNavSubItemProps = React.ComponentProps<typeof Sidebar.MenuSubItem>

type AppShellNavSubLinkProps = Omit<React.ComponentProps<typeof Sidebar.MenuSubButton>, "isActive"> & {
  active?: boolean
}

type AppShellNotificationItemProps = React.ComponentProps<typeof ark.li> & {
  /** Mark the notification unread; sets `data-unread` and shows the indicator. */
  unread?: boolean
  /** Render the item's child (e.g. an anchor or button) as the interactive surface. */
  asChild?: boolean
}

type AppShellNotificationItemContentProps = React.ComponentProps<typeof ark.div>

type AppShellNotificationItemDescriptionProps = React.ComponentProps<typeof ark.p>

type AppShellNotificationItemIconProps = React.ComponentProps<typeof ark.div>

type AppShellNotificationItemIndicatorProps = React.ComponentProps<typeof ark.span>

type AppShellNotificationItemTimeProps = React.ComponentProps<typeof ark.time>

type AppShellNotificationItemTitleProps = React.ComponentProps<typeof ark.p>

type AppShellNotificationsProps = React.ComponentProps<typeof Popover.Root>

type AppShellNotificationsActionTriggerProps = React.ComponentProps<typeof Button>

type AppShellNotificationsContentProps = React.ComponentProps<typeof Popover.Content>

type AppShellNotificationsEmptyProps = React.ComponentProps<typeof ark.div>

type AppShellNotificationsFooterProps = React.ComponentProps<typeof ark.div>

type AppShellNotificationsHeaderProps = React.ComponentProps<typeof ark.div>

type AppShellNotificationsListProps = React.ComponentProps<typeof ark.ul>

type AppShellNotificationsTitleProps = React.ComponentProps<typeof ark.h3>

type AppShellNotificationsTriggerProps = React.ComponentProps<typeof Button> & {
  /** Unread count shown as a badge; hidden when 0. */
  count?: number
  /** Cap for the badge count; larger counts render as `max+`. */
  max?: number
}

type AppShellSearchProps = React.ComponentProps<typeof Button> & { placeholder?: string }

type AppShellSidebarProps = React.ComponentProps<typeof Sidebar.Root>

type AppShellSkipLinkProps = React.ComponentProps<typeof ark.a>

type AppShellThemeToggleProps = Omit<React.ComponentProps<typeof Button>, "onChange"> & {
  /** Current theme: `light`, `dark`, or `system`. */
  theme: Theme
  /** Called with the next theme when the toggle is used. */
  onThemeChange: (theme: Theme) => void
}

type AppShellTopNavProps = React.ComponentProps<typeof ark.nav>

type AppShellTopNavLinkProps = React.ComponentProps<typeof ark.a> & { active?: boolean }

type AppShellTopNavMenuProps = React.ComponentProps<typeof DropdownMenu.Root> & { className?: string }

type AppShellUserProps = React.ComponentProps<typeof Sidebar.MenuButton>

type AppShellUserAvatarProps = React.ComponentProps<typeof Avatar.Root> & {
  src?: string
  alt?: string
  fallback: React.ReactNode
}

type AppShellUserEmailProps = React.ComponentProps<typeof ark.span>

type AppShellUserNameProps = React.ComponentProps<typeof ark.span>

type AppShellUserTextProps = React.ComponentProps<typeof ark.div>

const AppShell = {
  Root: AppShellRoot,
  Brand: AppShellBrand,
  BrandChevron: AppShellBrandChevron,
  BrandDescription: AppShellBrandDescription,
  BrandLogo: AppShellBrandLogo,
  BrandText: AppShellBrandText,
  BrandTitle: AppShellBrandTitle,
  CommandDialog: AppShellCommandDialog,
  Content: AppShellContent,
  Header: AppShellHeader,
  HeaderActions: AppShellHeaderActions,
  Main: AppShellMain,
  Nav: AppShellNav,
  NavBadge: AppShellNavBadge,
  NavCollapsible: AppShellNavCollapsible,
  NavItem: AppShellNavItem,
  NavLabel: AppShellNavLabel,
  NavLink: AppShellNavLink,
  NavList: AppShellNavList,
  NavMenuLink: AppShellNavMenuLink,
  NavSubItem: AppShellNavSubItem,
  NavSubLink: AppShellNavSubLink,
  NotificationItem: AppShellNotificationItem,
  NotificationItemContent: AppShellNotificationItemContent,
  NotificationItemDescription: AppShellNotificationItemDescription,
  NotificationItemIcon: AppShellNotificationItemIcon,
  NotificationItemIndicator: AppShellNotificationItemIndicator,
  NotificationItemTime: AppShellNotificationItemTime,
  NotificationItemTitle: AppShellNotificationItemTitle,
  Notifications: AppShellNotifications,
  NotificationsActionTrigger: AppShellNotificationsActionTrigger,
  NotificationsContent: AppShellNotificationsContent,
  NotificationsEmpty: AppShellNotificationsEmpty,
  NotificationsFooter: AppShellNotificationsFooter,
  NotificationsHeader: AppShellNotificationsHeader,
  NotificationsList: AppShellNotificationsList,
  NotificationsTitle: AppShellNotificationsTitle,
  NotificationsTrigger: AppShellNotificationsTrigger,
  Search: AppShellSearch,
  Sidebar: AppShellSidebar,
  SkipLink: AppShellSkipLink,
  ThemeToggle: AppShellThemeToggle,
  TopNav: AppShellTopNav,
  TopNavLink: AppShellTopNavLink,
  TopNavMenu: AppShellTopNavMenu,
  User: AppShellUser,
  UserAvatar: AppShellUserAvatar,
  UserEmail: AppShellUserEmail,
  UserName: AppShellUserName,
  UserText: AppShellUserText,
}

export {
  AppShell,
  useAppShell,
  type SidebarCollapsible,
  type SidebarVariant,
  type Theme,
  type AppShellRootProps,
  type AppShellBrandProps,
  type AppShellBrandChevronProps,
  type AppShellBrandDescriptionProps,
  type AppShellBrandLogoProps,
  type AppShellBrandTextProps,
  type AppShellBrandTitleProps,
  type AppShellCommandDialogProps,
  type AppShellContentProps,
  type AppShellHeaderProps,
  type AppShellHeaderActionsProps,
  type AppShellMainProps,
  type AppShellNavProps,
  type AppShellNavBadgeProps,
  type AppShellNavCollapsibleProps,
  type AppShellNavItemProps,
  type AppShellNavLabelProps,
  type AppShellNavLinkProps,
  type AppShellNavListProps,
  type AppShellNavMenuLinkProps,
  type AppShellNavSubItemProps,
  type AppShellNavSubLinkProps,
  type AppShellNotificationItemProps,
  type AppShellNotificationItemContentProps,
  type AppShellNotificationItemDescriptionProps,
  type AppShellNotificationItemIconProps,
  type AppShellNotificationItemIndicatorProps,
  type AppShellNotificationItemTimeProps,
  type AppShellNotificationItemTitleProps,
  type AppShellNotificationsProps,
  type AppShellNotificationsActionTriggerProps,
  type AppShellNotificationsContentProps,
  type AppShellNotificationsEmptyProps,
  type AppShellNotificationsFooterProps,
  type AppShellNotificationsHeaderProps,
  type AppShellNotificationsListProps,
  type AppShellNotificationsTitleProps,
  type AppShellNotificationsTriggerProps,
  type AppShellSearchProps,
  type AppShellSidebarProps,
  type AppShellSkipLinkProps,
  type AppShellThemeToggleProps,
  type AppShellTopNavProps,
  type AppShellTopNavLinkProps,
  type AppShellTopNavMenuProps,
  type AppShellUserProps,
  type AppShellUserAvatarProps,
  type AppShellUserEmailProps,
  type AppShellUserNameProps,
  type AppShellUserTextProps,
}
