## How it works

`Fieldset.Root` groups related fields using `Legend`, `HelperText`, and `ErrorText`. Typography and spacing follow the React component. The legend is exposed as a heading without grouping children into a single accessibility element.

Set `disabled` on the root to disable nested `Field` controls. Nested fieldsets cannot re-enable a disabled parent. Other standalone controls must receive `disabled` explicitly. `invalid` displays the fieldset's `ErrorText` but does not mark every individual field invalid.

`Fieldset.Context` and `useFieldsetContext` expose the current state for custom controls. Use React Native `style` and accessibility props; this port does not use a DOM fieldset or Ark RootProvider.
