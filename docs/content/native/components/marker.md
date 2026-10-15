## How it works

Marker provides `Root`, `Icon`, and `Content` for muted labels and conversation dividers. The default, separator, and border variants use the desktop component's 14px/20px regular text, 16px icons, 8px gap, and theme border color. Long labels wrap within the available width. Separator rules shrink to leave room for the label.

Root accepts native Pressable props, plus `variant` and a static `style`. It renders a passive View until `onPress` or `onLongPress` is supplied. Use `accessibilityRole="link"` with an `onPress` handler for navigation; the label is underlined and both label and icon brighten on hover or press. Navigation is consumer-owned. Disabled actions are dimmed and do not run. Keyboard focus uses the shared ring and reduced-motion setting.

Icon is decorative and hidden from accessibility. It supplies the default size and color to its icon child while preserving explicit overrides. Content accepts native Text props, including nested Text for inline links. Native underlines follow the platform's text rendering; CSS underline offsets and `asChild` are not available. Native writing direction controls row order.
