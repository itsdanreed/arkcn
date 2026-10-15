## How it works

Alert Dialog uses the native Dialog foundation for decisions that need explicit confirmation. Outside presses do not dismiss it by default, and Cancel receives initial accessibility focus. Android Back and accessibility escape cancel unless `closeOnEscape={false}`.

Compose `Cancel` and `CloseTrigger` in the footer. Attach your action to the latter's `onPress`; prevent the event when validation or an asynchronous operation should keep the dialog open, or control `open` externally.

`size="sm"` caps the surface at 320 px and gives the footer two equal columns. `Media` supports a small icon beside the title and description on wider screens, or above them on phones. Both sizes use shared dark/light tokens and reduced-motion-aware transitions. See Dialog for focus refs, safe-area insets, and the `expo-blur` Android backdrop setup.
