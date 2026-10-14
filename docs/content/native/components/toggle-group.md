## Toggle Group

Compose `ToggleGroup.Root` and uniquely valued `ToggleGroup.Item` parts. The group defaults to single selection;
set `multiple` for independent choices and `deselectable={false}` to prevent deselection. Use `defaultValue` or
controlled `value` with `onValueChange({ value })`. Root and item `disabled` states both prevent changes.

`variant` and `size` on Root apply to all items. `spacing` uses four-pixel units; zero joins the controls with shared
borders and rounded outside corners. `orientation="vertical"` stacks them. Items are native buttons with selected-state
announcements. Supply an accessibility label for icon-only items.

`useToggleGroup` with `ToggleGroup.RootProvider` supports externally owned state. `ToggleGroup.Context` and
`useToggleGroupContext` expose the current selection. Keep items as direct children for joined edge styling.
Native focus navigation follows the platform; browser arrow-key roving and DOM prop getters are not implemented by this adapter.
