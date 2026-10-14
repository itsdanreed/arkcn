## Checkbox

Compose `Checkbox.Root`, `Checkbox.Control`, and `Checkbox.Label`. Control renders a check or mixed-state mark
by default; use `Checkbox.Indicator` to supply your own native icon. The entire label is pressable.

Use `checked` for controlled state, `defaultChecked` for initial state, and
`onCheckedChange={({ checked }) => setChecked(checked)}` for updates. Checkbox accepts `true`, `false`, and
`"indeterminate"`; pressing an indeterminate checkbox selects it. `disabled` and `readOnly` prevent changes.
`invalid` adds the error border; supply an `accessibilityHint` explaining the error. Native checkboxes do not
need HiddenInput. Checkbox group selection is owned by the caller in this port.
