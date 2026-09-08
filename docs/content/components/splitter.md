# Splitter

Splitter.Root receives a panels array describing each panel's id and constraints. Render Panel for each id, with ResizeTrigger between adjacent panels. A trigger id uses the form left:right. ResizeTriggerIndicator is an optional visual grip.

Numeric sizes are percentages. Use unit strings such as 80px for pixel constraints. defaultSize initializes an uncontrolled layout; size and onResize support controlled layouts. Panel constraints can include collapsible and collapsedSize.

Drag a handle or use arrow keys while it is focused. orientation controls horizontal or vertical layout. RootProvider exposes the useSplitter API; createRegistry supports shared handles in nested layouts. The separate Resizable integration remains available, while these parts use Ark.
