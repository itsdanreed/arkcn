## How it works

The collapsible sidebar the app shell is built on. `Sidebar.Provider` owns open state and the mobile sheet, `Sidebar.Root` renders the panel with `variant` (`sidebar`, `floating`, `inset`) and `collapsible` (`offcanvas`, `icon`, `none`), `Sidebar.Trigger` toggles it, and `Sidebar.Inset` is the main area beside it. `useSidebar()` exposes the state.

## Parts

`Sidebar.Header`, `Sidebar.Content`, and `Sidebar.Footer` split the panel. Inside, `Sidebar.Group` with `Sidebar.GroupLabel`, `Sidebar.GroupAction`, and `Sidebar.GroupContent` holds `Sidebar.Menu` lists of `Sidebar.MenuItem` with `SidebarMenuButton isActive= tooltip=`, `Sidebar.MenuAction`, `Sidebar.MenuBadge`, and `Sidebar.MenuSub` with `Sidebar.MenuSubItem` and `Sidebar.MenuSubButton`. `Sidebar.Input`, `Sidebar.Separator`, `Sidebar.Rail` (a thin strip that reopens a collapsed sidebar), and `Sidebar.MenuSkeleton` complete the set.

## Notes

- Menu buttons are polymorphic via `asChild`, so links from any router work.
- In `icon` mode the tooltip shows the label next to the collapsed icon.
