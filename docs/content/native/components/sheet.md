## How it works

Sheet reuses the native Dialog's controlled/uncontrolled state, focus refs, accessibility escape, Android Back handling, and outside dismissal. `Content` owns the Modal; no Portal or Positioner is needed. `side` accepts `top`, `right` (default), `bottom`, or `left`.

Side panels fill the available height and use 75% of the viewport width, capped at 384 px at widths of 640 px and above. Top and bottom panels fit their content. Long content scrolls within the panel; side-panel footers sit at the bottom when space allows. Put body content in your own padded View. Header and Footer provide their own 16 px padding.

Pass `safeAreaInsets` from `useSafeAreaInsets()` to Root to protect content from notches and home indicators. The surface still reaches the screen edge. The keyboard reduces available space on iOS, with scrolling for long forms.

Motion matches the web Sheet: a 200 ms fade and 40 px directional translation, with a 150 ms backdrop fade. Reduced motion disables these transitions. Colors, borders, type, and spacing use the shared light/dark theme.

This is an edge panel, without drag-to-dismiss or snap points. Dialog's `expo-blur` setup also applies: Android blur needs a `BlurTargetView` reference passed as `blurTarget`; otherwise the backdrop is tinted/dimmed. Native blur is platform-rendered.
