## How it works

The application frame: a collapsible sidebar with brand, navigation, and user menu; a header with search, notifications, and a theme toggle; and the main area. It is router-agnostic. Navigation links are plain anchors wrapped with `asChild`, so any router works, and you mark the active one yourself.

`AppShell.Root` owns the sidebar variant and collapse mode (both controllable) and the command-search open state, with `searchShortcut` binding Cmd or Ctrl+K unless you turn it off to use the hotkeys registry instead.

## Parts

Sidebar: `AppShell.Sidebar` with `AppShellSidebarHeader` (`AppShell.Brand` with logo, title, and description), `AppShellSidebarContent` of `AppShell.Nav` groups (`AppShell.NavLabel`, `AppShell.NavList`, `AppShell.NavItem` with `AppShellNavLink active=` and `AppShell.NavBadge`, or `AppShell.NavCollapsible` with `AppShell.NavSubItem` and `AppShell.NavSubLink`, which becomes a flyout menu when the sidebar is collapsed to icons), and `AppShellSidebarFooter` with the `AppShell.User` parts.

Content: `AppShell.Content` with `AppShell.Header` (fixed or sticky, with a scroll shadow and the sidebar trigger), `AppShell.HeaderActions`, `AppShell.Search` plus `AppShell.CommandDialog` (nest a `Command.Root` inside), `AppShell.Notifications` (a popover bell with a count badge and `AppShell.NotificationItem`s), `AppShell.ThemeToggle`, and `AppShell.Main`, where `fixed` makes the content viewport height and the main area scroll internally, and `fluid` removes the max width. `AppShell.TopNav` parts add a horizontal nav to the header.

## Notes

- Built on the `sidebar` component, which you can also use on its own.
- No theme library is assumed; the toggle takes `theme` and `onThemeChange`.

## Scrolling and keyboard navigation

Use `AppShell.Header fixed` with `AppShell.Main fixed` for a header above an independently scrolling main area.
The main area owns vertical scrolling and fills the remaining viewport height. Its header shadow follows that
scroll position, as well as document or ancestor scrolling. Independently scrolling lists and portalled popovers
do not change the header shadow. For an embedded preview, set a height on `AppShell.Content`.

`AppShell.Content` is a layout div; `AppShell.Main` is the main landmark. `AppShell.SkipLink` points to the main
area's default `id="content"`, which accepts focus without adding a tab stop. For multiple shells on one page,
use a unique main `id` and matching skip-link `href`. The default ID belongs to Main, not Content.

`AppShell.TopNavLink active` exposes `aria-current="page"`. Compose `AppShell.TopNavMenu` with the same links
for smaller screens; the desktop navigation appears at the `lg` breakpoint. Main content is capped at 80rem when
its content container reaches 80rem; `fluid` keeps it full width.

For RTL, wrap the shell in Ark's `LocaleProvider` with an RTL locale and place the sidebar on `side="right"`.
The inset content margin and collapsed navigation flyout mirror the left-side layout. `variant` accepts `sidebar`,
`inset`, or `floating`; `collapsible="none"` renders the plain, always-visible sidebar, as in the upstream Sidebar.
