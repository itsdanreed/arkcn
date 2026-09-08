## How it works

A panel that slides in from an edge, on Ark UI's Drawer. It supports swipe to dismiss on touch, a grabber, and stacking: wrap page content in `Drawer.Stack` and `Drawer.Indent`, and nested drawers push the content back with `Drawer.IndentBackground` behind it.

## Parts

`Drawer.Trigger` opens it. `Drawer.Content` renders the portal, overlay, and positioner and holds `Drawer.Grabber`, `Drawer.Header` with `Drawer.Title` and `Drawer.Description`, your content, and `Drawer.Footer`; `Drawer.CloseTrigger` closes from inside. `Drawer.SwipeArea` marks the region that starts a swipe.

## Notes

- Use `Sheet.Root` for a side panel that does not need swipe or stacking; it shares the Dialog machine.
- `open`, `defaultOpen`, and `onOpenChange` control it like every overlay.
