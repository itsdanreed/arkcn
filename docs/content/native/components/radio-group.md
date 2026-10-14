## Radio Group

Set `value` or `defaultValue` on Root and give every Item a unique string `value`.
`onValueChange={({ value }) => setValue(value)}` fires when a different enabled option is chosen.

A string child on Item renders the circular control and label automatically. For a custom layout, compose
ItemControl and ItemText inside Item. Label the group with `accessibilityLabel`, and label custom items when
their native text does not describe the choice. Root supports `disabled`, `readOnly`, and `invalid`; Item can
also be individually disabled. There is no DOM HiddenInput or browser arrow-key navigation in this port.
