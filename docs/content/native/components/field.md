## How it works

Compose `Field.Root`, `Label`, `Input` or `Textarea`, and `HelperText` / `ErrorText`. Inputs retain the standard arkcn styles, including 14px text at every viewport size. Pressing a label focuses its input. The native input receives the label and a hint containing required, error, and helper text.

`disabled`, `readOnly`, `required`, and `invalid` belong on the root. A disabled enclosing `Fieldset` disables its fields. `ErrorText` appears only for an invalid field; its optional `errors` array deduplicates messages. `RequiredIndicator` renders an asterisk only when required. Values use native `value` / `onChangeText`, and refs expose the native input.

`Group`, `Set`, `Legend`, `Content`, `Title`, and `Separator` organize form layouts. `orientation="responsive"` switches to a row at a measured field width of 448px. All parts accept native `style` overrides. Native text scaling remains enabled.

Use `Field.Context` or `useFieldContext` to connect custom controls. Native select controls are not included in this port; web-only `Select`, `Item`, `asChild`, and Ark RootProvider APIs are not exposed.
