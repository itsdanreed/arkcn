## Input Group

Compose Root with Input or Textarea and any Addon, Text, or Trigger parts. The group owns the shared border, background,
and focus or validation ring; the text control stays borderless. Control `disabled` and `invalid` props update the group,
including after mount. The group uses the web color transition duration and curve; its focus ring appears immediately.

Addon supports `inline-start`, `inline-end`, `block-start`, and `block-end`. Direct addons are ordered around the control
regardless of their source order. Block addons and Textarea switch to a vertical layout. Press an addon to focus the
input; nested Trigger presses retain their own action and do not focus it. `onPress` can prevent addon activation.

Input and Textarea accept native text-entry props and refs. Use `value`/`onChangeText`, `accessibilityLabel`, and `style`.
Text styles addons with muted typography; Trigger supports `xs`, `sm`, `icon-xs`, and `icon-sm` plus Button variants.
Unlike HTML, native controls use explicit accessibility labels and do not submit a form automatically.
