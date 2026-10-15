## How it works

`Editable` switches between a text preview and the standard arkcn native Input. Compose `Root`, `Label`, `Area`, `Input`, and `Preview`; `Control`, `EditTrigger`, `SubmitTrigger`, and `CancelTrigger` support explicit actions. Triggers accept the native Button props, including icon children and an `accessibilityLabel`.

Use `value` / `defaultValue` and `onValueChange({ value })` for the draft text. `onValueCommit` reports a saved value; `onValueRevert` reports the original value restored by Cancel. `edit` / `defaultEdit` and `onEditChange({ edit })` control editing independently. `Context` and `useEditableContext` expose `edit()`, `submit()`, `cancel()`, and `setValue()`.

By default, tapping the preview enters editing, selects its text, and opens the keyboard. Done/Enter or leaving the input saves. Set `submitMode` to `enter`, `blur`, or `none` for explicit control. Escape cancels when the platform delivers that key. `activationMode="none"` requires an Edit trigger or context action. The native port uses `press` rather than DOM focus/double-click activation modes.

Cancel restores the value from the beginning of the edit session. Save/Cancel presses take priority over blur so a Cancel action cannot accidentally commit the draft. In scrollable screens, use `keyboardShouldPersistTaps="handled"` on your enclosing ScrollView so action buttons receive the first tap while the keyboard is open. Use keyboard avoidance (for example, `automaticallyAdjustKeyboardInsets` on iOS) to keep inputs and actions visible.

`disabled`, `readOnly`, and disabled Fieldsets prevent editing. `placeholder` is shown for an empty value; complex labels can provide an explicit `accessibilityLabel`. The preview matches the web control's 32px height, typography, padding, focus ring, and light/dark colors. Hover/press feedback uses the shared motion timing and honors reduced motion. The editor retains the standard native Input styles and system font scaling.

There is no DOM form input, `RootProvider`, or `asChild` API. Use native `style`, `textStyle` on Preview, and `onPress` on triggers. Mobile keyboards do not provide an Escape key; include a Cancel trigger when cancellation must be available on touch devices.
