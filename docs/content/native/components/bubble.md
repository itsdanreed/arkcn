## How it works

Bubble supports `Root`, `Group`, `Content`, and `Reactions`, with the web variants: `default`, `secondary`, `muted`, `tinted`, `outline`, `ghost`, and `destructive`. It uses the same 80% maximum width, shared corner radius, 12px/8px content padding, and 14px relaxed text. Ghost bubbles can use the full width and remove padding and rounding. Tinted surfaces derive their hue from the theme's primary color.

`align="end"` places a bubble at the trailing edge. Inside Message, it inherits the sender's alignment unless explicitly overridden. Bare strings become native Text; explicit Text children keep their own styles. `textStyle` customizes the default text, and `style` merges last on each part.

Content becomes an accessible Pressable when given `onPress` or `onLongPress`; otherwise it is a passive View. It supports disabled state, hover/press feedback, keyboard focus rings, and shared reduced-motion behavior. Use native callbacks directly instead of `asChild`. Give interactive content an accessible label when its children do not convey the action.

Reactions accepts `side="top" | "bottom"` and `align="start" | "end"`. Its offset is measured from its actual height, including larger text. Use `interactive` when it contains Buttons to remove the normal text padding. Reaction actions are siblings of Content, so they do not activate the message. Leave extra space between messages when using reactions, just as on web; their intentional overlap does not add layout height.

Custom native fonts may change glyph metrics. Screen-reader navigation and Android visuals remain unverified.

The iOS 26.3 Simulator used for validation renders emoji as missing-glyph boxes even in unstyled native Text. Reaction labels and actions work; emoji appearance needs verification on a physical device or a corrected simulator runtime.
