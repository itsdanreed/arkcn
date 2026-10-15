## How it works

`Dialog.Content` owns a native Modal, backdrop, keyboard avoidance, and a scrollable content area for long forms. No Portal or Positioner is needed. Use `defaultOpen`, or control `open` with `onOpenChange({ open })`. `useDialog`, `RootProvider`, and `Context` support external composition.

Outside presses close a Dialog by default. `closeOnInteractOutside={false}` disables that behavior. `closeOnEscape={false}` disables Android Back, Escape on web, and the accessibility escape gesture. `showCloseButton={false}` hides the corner close button. Prevent a trigger's press event to keep it from opening or closing.

Pass `initialFocusRef` to focus an input on opening, and `finalFocusRef` to choose where focus returns; otherwise the title receives accessibility focus and the trigger is restored on dismissal. Pass safe-area insets from your app through `safeAreaInsets` for edge-to-edge layouts.

The surface uses shared light/dark colors, typography, spacing, a 100 ms fade/scale transition, and the reduced-motion preference. Install `expo-blur` with `npx expo install expo-blur`. On Android, wrap the app surface in `BlurTargetView` and pass its ref as `blurTarget`; without it the backdrop uses tint/dimming. Native blur is platform-rendered and may differ slightly from the web blur.
