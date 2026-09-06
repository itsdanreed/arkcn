## How it works

A panel that slides in from an edge, on Ark UI's Drawer. It supports swipe to dismiss on touch, a grabber, and stacking: wrap page content in `DrawerStack` and `DrawerIndent`, and nested drawers push the content back with `DrawerIndentBackground` behind it.

## Parts

`DrawerTrigger` opens it. `DrawerContent` renders the portal, overlay, and positioner and holds `DrawerGrabber`, `DrawerHeader` with `DrawerTitle` and `DrawerDescription`, your content, and `DrawerFooter`; `DrawerClose` closes from inside. `DrawerSwipeArea` marks the region that starts a swipe.

## Notes

- Use `Sheet` for a side panel that does not need swipe or stacking; it shares the Dialog machine.
- `open`, `defaultOpen`, and `onOpenChange` control it like every overlay.
