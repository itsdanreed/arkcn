## Switch

Compose `Switch.Root`, `Switch.Control`, and `Switch.Label`. Control includes Thumb automatically; supply a
`Switch.Thumb` child when customizing it. Sizes are `default` and `sm`, matching the web track dimensions.

Use `checked` / `defaultChecked` and `onCheckedChange={({ checked }) => setChecked(checked)}`. The label and
track share one press target. `disabled` and `readOnly` block changes; `invalid` adds error styling.
Label switches without visible text using `accessibilityLabel`. Native switches do not need HiddenInput.
