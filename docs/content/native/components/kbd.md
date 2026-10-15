## How it works

Use `Kbd.Root` for a shortcut key and `Kbd.Group` for a chord. The labels use the web component's 20px minimum dimensions, 12px medium text, muted background, 6px radius, and 4px internal/group gaps. Direct icons default to 12px and the label color; explicit size/color props are preserved.

Kbd is a non-interactive label and does not register keyboard shortcuts. It can describe hardware-keyboard commands in an Expo app. Supply an accessible group label such as `accessibilityLabel="Command K"` with `accessible` when symbols should be announced as a single phrase.

Light/dark colors follow NativeThemeProvider or system appearance. Text scaling stays enabled and the label can grow taller. `variant="tooltip"` selects the web tooltip's inverted colors; the native caller sets this explicitly because there are no ancestor CSS selectors. This does not create or require a Tooltip component.

Use native `style` on either part and `textStyle` on Root. Compose Text and icons for custom labels; there is no HTML kbd element or `asChild` API.
