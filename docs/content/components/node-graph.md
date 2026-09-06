## How it works

A node editor in the visual-scripting style. You own the nodes and edges; `NodeGraph` owns the viewport (pan and zoom, controllable), the selection (controllable), and in-flight interactions. Everything else is an intent: `onNodesMove` while dragging and `onNodesMoveEnd` once per drag, `onConnect({ source, target })` where the source is always the output side, `onConnectEnd` when a connection is dropped on empty space (a good moment to offer an add-node menu), `onDelete(selection)`, `onDisconnect(port)` for Alt+click on a pin, and context-menu events for the pane, nodes, edges, and ports.

## Parts

`NodeGraphViewport` is the pane and keyboard target. `NodeGraphBackground` draws dots or lines. `NodeGraphSurface` is the transformed layer holding `NodeGraphEdges` with `NodeGraphEdge value= source= target=` curves, the `NodeGraphConnectionLine` while dragging, and your `NodeGraphNode value= position=` elements. A node composes `NodeGraphNodeHeader` with `NodeGraphNodeTitle`, `NodeGraphNodeSubtitle`, and `NodeGraphNodeActions`, then `NodeGraphNodeBody` with `NodeGraphNodeInputs` and `NodeGraphNodeOutputs` of `NodeGraphPort value= side= type=` rows, each with a `NodeGraphPortPin` and `NodeGraphPortLabel`. Port positions are measured from the DOM, so nodes need no size props. `NodeGraphControls`, `NodeGraphMinimap`, `NodeGraphSelectionBox`, and `NodeGraphEmpty` complete the set.

## Interaction

Wheel zooms; `panOnScroll` flips plain wheel to pan. Middle, right, or Alt drag, Space plus drag, or a single touch pans; left drag on empty space draws a marquee. Delete removes the selection, Escape clears it, Cmd or Ctrl+A selects all, arrows nudge by `snapGrid`, and Cmd with plus, minus, and zero zoom. Double-click a node to zoom to it. Connections are valid when the sides differ, the nodes differ, and the port types match or either is `any`; override that with `isValidConnection`. Return the other end of a pin's edge from `edgeAt` to let users pick a link up and re-route it.

## Notes

- `useNodeGraph()` exposes `screenToGraph`, `fitView`, `zoomTo`, and `centerOn`.
- Extra `data-*` props on a node pass through, which is how a simulation can highlight the active node.
