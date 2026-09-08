## How it works

A drag-and-drop layout surface for rows and columns, the model behind the form builder and the dashboard widget board. `Canvas.Root` owns nothing but drag state. Every drop is an intent, `onDrop({ source, target })`: the source is a palette item (`{ type: "palette", data }`, with your data passed back untouched) or a node (`{ type: "node", id }`), and the target is a node edge (`{ type: "node", id, edge }`, the closest of top, bottom, left, right) or the empty area. Dropping above or below a node makes a new row; dropping beside it makes a column. The `applyRowDrop`, `resizeRowItems`, and `removeRowItem` helpers in `lib/row-layout` apply those intents to a `{ id, items: { id, width }[] }[]` layout.

## Parts

`Canvas.Palette` holds `CanvasPaletteItem data=` sources. `Canvas.Area` is the drop surface and auto-scrolls. `Canvas.Row` is a flex row where each `CanvasNode value= width=` grows by its width weight; the node is draggable by its `Canvas.NodeHandle` and shows a `Canvas.DropIndicator` on the edge being targeted. `Canvas.NodeHeader`, `Canvas.NodeTitle`, and `Canvas.NodeActions` build the node chrome. Place a `Canvas.ResizeHandle` between siblings; it reports `onResize(deltaFraction)` relative to the row width, and while dragging every node in that row shows a `Canvas.NodeOverlay` with its percentage share.

## Keyboard

Nodes and handles pick up with Space or Enter. Up and down drop on the row above or below (or pull the node out into its own row when it has siblings), left and right drop beside the neighbour. Palette items are focusable and Enter or Space drops them on the area. A live region announces each move.
