## Toggle

Compose `Toggle.Root` with text or an icon. The `default` and `outline` variants and `sm`, `default`, and `lg`
sizes use the web dimensions, colors, radii, and 150 ms transitions. Supply an accessibility label for icon-only controls.

Use `defaultPressed` for local state, or `pressed` and `onPressedChange` to control it. The callback receives a
boolean, matching Ark's Toggle API. `disabled` prevents interaction. `onPress` can cancel the change with
`event.preventDefault()`.

`Toggle.Indicator` renders its children when pressed and its `fallback` otherwise. `Toggle.Context` and
`useToggleContext` expose the state; `useToggle` provides standalone state. Native style props replace CSS classes.
The native button announces its selected state. Browser-specific form and DOM prop getters are not part of the native hook.
