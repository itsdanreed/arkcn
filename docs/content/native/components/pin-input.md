## How it works

Compose `PinInput.Root`, `Label`, `Control`, and one `Input index={index}` for each cell. `count` defaults to six; set it explicitly for other lengths. Cells use the standard native Input's 32px height, 14px typography, focus ring, validation colors, disabled treatment, and reduced-motion transitions. The control keeps the web component's 8px spacing and empty-circle placeholders.

Use `value`/`defaultValue` as a string array. `onValueChange` and `onValueComplete` receive `{ value, valueAsString }`. `PinInput.Context` exposes the current value, completion state, `clearValue()`, `setValue()`, and `focus(index)`. `usePinInput` with `RootProvider` supports externally owned state. Native forms consume these values directly; there is no DOM HiddenInput.

Entry advances focus. Deleting a filled cell clears it and moves back; deleting an empty cell clears the previous cell. Focusing a cell selects its character for replacement. Paste distributes characters from the selected cell; a full-length code fills from the beginning, including when an OS autofill suggestion targets a later cell. Spaces and dashes in formatted codes are ignored. Other invalid characters are rejected through `onValueInvalid`. The default `type` is numeric; alphabetic and alphanumeric codes are also supported.

`otp` enables the native one-time-code autofill hints. Availability depends on the operating system and incoming message format; simulator typing/paste checks do not establish real SMS delivery. `mask` uses native secure text entry; do not toggle it while editing. `blurOnComplete` optionally dismisses the keyboard. `disabled`, `readOnly`, and `invalid` apply across the cells, and Root inherits disabled/invalid state from Fieldset.

A plain-text Label supplies each cell's accessible name and position. Supply `accessibilityLabel` on each Input for rich labels or localized position wording. Keyboard arrow navigation follows layout direction. Keep the complete code within the available width; longer codes can use a caller-provided layout or smaller spacing.
