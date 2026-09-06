## How it works

The collapsible sidebar the app shell is built on. `SidebarProvider` owns open state and the mobile sheet, `Sidebar` renders the panel with `variant` (`sidebar`, `floating`, `inset`) and `collapsible` (`offcanvas`, `icon`, `none`), `SidebarTrigger` toggles it, and `SidebarInset` is the main area beside it. `useSidebar()` exposes the state.

## Parts

`SidebarHeader`, `SidebarContent`, and `SidebarFooter` split the panel. Inside, `SidebarGroup` with `SidebarGroupLabel`, `SidebarGroupAction`, and `SidebarGroupContent` holds `SidebarMenu` lists of `SidebarMenuItem` with `SidebarMenuButton isActive= tooltip=`, `SidebarMenuAction`, `SidebarMenuBadge`, and `SidebarMenuSub` with `SidebarMenuSubItem` and `SidebarMenuSubButton`. `SidebarInput`, `SidebarSeparator`, `SidebarRail` (a thin strip that reopens a collapsed sidebar), and `SidebarMenuSkeleton` complete the set.

## Notes

- Menu buttons are polymorphic via `asChild`, so links from any router work.
- In `icon` mode the tooltip shows the label next to the collapsed icon.
