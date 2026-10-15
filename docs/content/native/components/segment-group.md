## How it works

Compose `SegmentGroup.Root`, `Indicator`, and one `Item` per choice. The group selects one value; pressing the selected item keeps it selected. Use `value` / `defaultValue` and `onValueChange({ value })` for controlled or uncontrolled selection. A `null` value clears selection and hides the indicator.

The native control matches the web group's muted track, typography, padding, radii, and selected surface in both themes. The single indicator measures each item's layout and slides between those bounds with the shared 150ms curve. It mounts at its first measured position, follows changed item dimensions, and disappears if the selected item is removed. Reduced motion makes the transition immediate. Native font scaling is retained.

Set `orientation="vertical"` for a column, `dir="rtl"` to reverse a horizontal group, and `disabled` or `readOnly` to block selection. Disabled Fieldsets also disable the group. Individual items can be disabled. Pass `accessibilityLabel` to Root to name the radio group; items expose their checked and disabled states.

`useSegmentGroup`, `RootProvider`, `Context`, and `useSegmentGroupContext` expose `value`, `setValue`, and `clearValue`. `ItemText` supports composed labels; `ItemContext` and `useSegmentGroupItemContext` expose checked, disabled, focused, and highlighted state. Use explicit native icon colors and sizes when composing icon labels. `Label` is available for visible labels.

Keep items as direct native children of Root (React fragments and context providers are fine), so their measured coordinates share the indicator's coordinate space. Use `style`, `textStyle`, and native press/focus handlers. There are no hidden DOM inputs, form serialization, `asChild`, or browser roving-tabindex APIs; selection is accessible through native radio semantics and touch/assistive-technology activation.
