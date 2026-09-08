## How it works

The application frame: a collapsible sidebar with brand, navigation, and user menu; a header with search, notifications, and a theme toggle; and the main area. It is router-agnostic. Navigation links are plain anchors wrapped with `asChild`, so any router works, and you mark the active one yourself.

`AppShell.Root` owns the sidebar variant and collapse mode (both controllable) and the command-search open state, with `searchShortcut` binding Cmd or Ctrl+K unless you turn it off to use the hotkeys registry instead.

## Parts

Sidebar: `AppShell.Sidebar` with `AppShellSidebarHeader` (`AppShell.Brand` with logo, title, and description), `AppShellSidebarContent` of `AppShell.Nav` groups (`AppShell.NavLabel`, `AppShell.NavList`, `AppShell.NavItem` with `AppShellNavLink active=` and `AppShell.NavBadge`, or `AppShell.NavCollapsible` with `AppShell.NavSubItem` and `AppShell.NavSubLink`, which becomes a flyout menu when the sidebar is collapsed to icons), and `AppShellSidebarFooter` with the `AppShell.User` parts.

Content: `AppShell.Content` with `AppShell.Header` (fixed or sticky, with a scroll shadow and the sidebar trigger), `AppShell.HeaderActions`, `AppShell.Search` plus `AppShell.CommandDialog` (nest a `Command.Root` inside), `AppShell.Notifications` (a popover bell with a count badge and `AppShell.NotificationItem`s), `AppShell.ThemeToggle`, and `AppShell.Main`, where `fixed` makes it viewport height so a page scrolls inside it and `fluid` removes the max width. `AppShell.TopNav` parts add a horizontal nav to the header.

## Notes

- Built on the `sidebar` component, which you can also use on its own.
- No theme library is assumed; the toggle takes `theme` and `onThemeChange`.
