## How it works

`NumberInput.Root` renders a numeric input and step buttons by default. Compose `Label`, `Control`, `Input`, and `Triggers` to add a label or replace individual parts. Pressing the label focuses the input. The control uses the same 32px height, 14px typography, borders, chevrons, focus ring, and light/dark tokens as React.

Use string `value` / `defaultValue` and `onValueChange({ value, valueAsNumber })`. An empty or incomplete value has `NaN` for `valueAsNumber`. `min`, `max`, and positive `step` govern stepping; decimal steps avoid floating-point display artifacts. Values typed outside the bounds clamp on blur or submit unless `clampValueOnBlur={false}`. Empty values stay empty; stepping from an empty input starts at zero, clamped to the bounds.

Inputs accept plain signed decimal numbers with a period or comma decimal separator. Partial input such as `-` or `1.` remains editable; blur normalizes valid numbers and clears incomplete ones. Currency, grouping separators, locale formatting, exponent entry, mouse-wheel stepping, and pointer scrubbing are not included. This native API does not expose Ark's `RootProvider`, DOM props, or `Scrubber`.

Holding a step button repeats after 400ms until release, a bound, or unmount; set `spinOnPress={false}` to step once per tap. Hardware arrow keys and accessibility increment/decrement actions also step the value. The compact buttons retain the web dimensions; direct numeric editing and accessibility actions are available as alternatives.

`disabled` and `readOnly` prevent edits and stepping; an enclosing disabled `Fieldset` also disables the control. `invalid` shows the shared validation styling. Give an unlabeled input an `accessibilityLabel` and use `accessibilityHint` for instructions or errors. `Context` / `useNumberInputContext` expose the value and actions, and `ValueText` renders the current string. Every part accepts native `style` overrides; reduced motion disables color transitions.
