## How it works

Clipboard copies plain text through `expo-clipboard`. Install it with `npx expo install expo-clipboard`; non-Expo apps need Expo modules configured. The component never reads or watches the clipboard. Web previews require a secure context and browser clipboard support.

Use `value` for controlled text or `defaultValue` with `useClipboard().setValue()` for internal state. `RootProvider` accepts the API returned by `useClipboard`. `Input` displays the value read-only and uses the standard arkcn Input typography and styling. `Control` lays it out beside the standard outline icon Button. `ValueText` provides a selectable monospace alternative.

The trigger swaps Copy for Check only after a successful write. The success state lasts 3000 ms by default (`timeout`), and a repeat copy restarts it. No extra icon animation is added; the web component also swaps directly. Button hover, press, and focus transitions retain reduced-motion support. Both themes use shared tokens.

`onCopy({ value })` reports a successful write. `onStatusChange({ copied })` reports success and reset; `onCopyError({ error })` reports rejection or an unavailable clipboard. `api.error` and `api.pending` support custom feedback. Failure never displays a success check. The trigger has localized labels through `translations.triggerLabel(copied)` and `translations.errorLabel`; give custom icon triggers an `accessibilityLabel` when needed.

Changing the value clears success, and stale asynchronous completions are ignored. Duplicate presses while a write is pending are ignored. `disabled` (including a parent Fieldset) blocks copying; a read-only display is still copyable. Native manual selection/copy is handled by the OS and does not drive the trigger's success state. There is no DOM `asChild`; customize the Trigger with native Button props and children.
