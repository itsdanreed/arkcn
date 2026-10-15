## How it works

`RatingGroup.Root` renders five stars by default. Compose `Label`, `Control`, and one `Item` per index to customize the content. Indices start at one; `Context` provides the `items` array. `ItemContext` provides `highlighted`, `half`, and `checked` for custom icons.

Use `value` / `defaultValue` and `onValueChange({ value })`. Values are bounded to zero through `count`; zero means unrated. Enable `allowHalf` to select half stars by tapping the leading half of a star. `dir` follows the device direction by default and accepts `ltr` / `rtl`. Hover and press previews do not commit a value; cancelling a press restores the selection. `disabled`, `readOnly`, or an enclosing disabled `Fieldset` prevent changes.

The native control is one adjustable accessibility element: VoiceOver and TalkBack increment/decrement actions change the rating in whole or half steps. The label and current value are announced together. Supply `accessibilityLabel` on `Control` when there is no visible label, and `getValueText` on `Root` to localize the announced value. The compact 20px stars match the web design; accessibility actions avoid requiring precise half-star taps.

In a browser, focus the control and use arrow keys, Home (unrated), or End (maximum). Native hardware keyboard handling depends on platform accessibility navigation; there is no hidden DOM input. The port does not expose `HiddenInput`, Ark `RootProvider`, or DOM form APIs. Read the current value through `Context` or `useRatingGroupContext`, whose `setValue` and `clearValue` actions respect disabled/read-only state.

Colors, 20px Lucide star shapes, spacing, and typography match arkcn in both themes. Color feedback uses the shared 150ms timing; reduced motion makes it immediate. Text retains system font scaling. All parts accept native `style` overrides.
