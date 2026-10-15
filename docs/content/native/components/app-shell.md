## How it works

`AppShell.Root` owns the sidebar layout, expanded state, mobile drawer, and search visibility. It supports `sidebar`, `floating`, and `inset` variants with `icon`, `offcanvas`, and `none` collapse modes. Each setting accepts a controlled value and change callback or a `default…` value. `useAppShell()` exposes these settings and actions to custom controls.

The shell measures its own container. Below 768px, icon/offcanvas sidebars become an animated modal drawer; selecting a `NavLink` closes it. Wider layouts keep the sidebar visible and animate width changes. `none` always keeps the sidebar visible, including on phones. Set `Sidebar.side="right"` and place it after `Content` for right-side navigation. Sidebar widths default to 256px, 48px collapsed (64px with inset/floating padding), and 288px in the mobile drawer.

Use `SidebarHeader`, `SidebarContent`, and `SidebarFooter` for independently scrolling navigation with a fixed brand and account area. `NavLink` takes `icon`, `label`, `active`, and `onPress`; the icon stays visible when collapsed and the complete label remains accessible. `NavCollapsible` expands subnavigation, or opens an accessible selection dialog when the sidebar is collapsed. Routing remains app-owned: call Expo Router or React Navigation from `onPress`.

`Header` stays above the scrolling `Main`; its trigger controls the sidebar. Main content is limited to 1280px unless `fluid` is true. Place the root inside a bounded `SafeAreaView` with `flex: 1`. Pass `useSafeAreaInsets()` into `Root.safeAreaInsets` so its full-screen overlays also respect device cutouts. Safe-area-context is only needed by the consuming app, not the component package.

`Search` opens `CommandDialog`, whose content and filtering are consumer-owned. `Notifications` supplies controlled/uncontrolled visibility, a count trigger, a scrolling list, notification items, and a footer. `ThemeToggle` offers Light, Dark, and System; connect its callback to `NativeThemeProvider`. On phones these utility surfaces use dismissible dialogs instead of anchored desktop popovers. Backdrop presses, accessibility escape, and Android Back dismiss them. Hardware keyboard shortcuts, desktop hover tooltips, and web-only skip links are not included.

Styling uses the shared sidebar palette, dimensions, typography, borders, and radii in both themes. Drawer, overlay, sidebar-width, and disclosure transitions respect reduced motion. The Expo validation app launches directly into the full-screen shell, with controls for all variants, collapse modes, themes, and motion.
