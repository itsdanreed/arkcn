## How it works

The application frame: a collapsible sidebar with brand, navigation, and user menu; a header with search, notifications, and a theme toggle; and the main area. It is router-agnostic. Navigation links are plain anchors wrapped with `asChild`, so any router works, and you mark the active one yourself.

`AppShell` owns the sidebar variant and collapse mode (both controllable) and the command-search open state, with `searchShortcut` binding Cmd or Ctrl+K unless you turn it off to use the hotkeys registry instead.

## Parts

Sidebar: `AppShellSidebar` with `AppShellSidebarHeader` (`AppShellBrand` with logo, title, and description), `AppShellSidebarContent` of `AppShellNav` groups (`AppShellNavLabel`, `AppShellNavList`, `AppShellNavItem` with `AppShellNavLink active=` and `AppShellNavBadge`, or `AppShellNavCollapsible` with `AppShellNavSubItem` and `AppShellNavSubLink`, which becomes a flyout menu when the sidebar is collapsed to icons), and `AppShellSidebarFooter` with the `AppShellUser` parts.

Content: `AppShellContent` with `AppShellHeader` (fixed or sticky, with a scroll shadow and the sidebar trigger), `AppShellHeaderActions`, `AppShellSearch` plus `AppShellCommandDialog` (nest a `Command` inside), `AppShellNotifications` (a popover bell with a count badge and `AppShellNotificationItem`s), `AppShellThemeToggle`, and `AppShellMain`, where `fixed` makes it viewport height so a page scrolls inside it and `fluid` removes the max width. `AppShellTopNav` parts add a horizontal nav to the header.

## Notes

- Built on the `sidebar` component, which you can also use on its own.
- No theme library is assumed; the toggle takes `theme` and `onThemeChange`.
