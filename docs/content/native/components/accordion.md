## Accordion

Compose Root, Item, ItemTrigger, and ItemContent. Each Item needs a unique `value`. Root accepts `defaultValue`, or
controlled `value` with `onValueChange({ value })`. `multiple` permits several open items; `collapsible` permits
closing the selected item in single mode. Root or item `disabled` prevents interaction.

The trigger uses the same spacing, border, typography, focus ring, and open/closed chevrons as the web component.
Content measures its natural height and animates on the UI thread for 200 ms with CSS's ease-out curve. Closing
content stays mounted until the animation finishes. Reduced motion removes the animation and exit delay.
`lazyMount` and `unmountOnExit` both default to true. Set `unmountOnExit={false}` to retain child state while closed.

Use ItemIndicator for an additional custom indicator; it rotates through 180 degrees with the web's 150 ms transition.
Context and ItemContext, plus their hooks, expose state without adding views. `useAccordion` and RootProvider support
externally owned state. Keep Items as direct children for separator styling.

Native triggers announce expanded and disabled states; closed panels are excluded from accessibility and touch input.
Text children receive the default typography; compose nested native Text for styled paragraphs. Browser-specific arrow-key
roving, DOM prop getters, and `asChild` are not part of this native adapter.
