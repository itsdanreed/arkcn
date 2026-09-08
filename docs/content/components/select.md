## How it works

A select on Ark UI: build a collection with `createListCollection`, pass it to `Select.Root`, and compose the trigger and content. The value is always a `string[]`, so single and `multiple` selection share one shape. Never render a native `<select>`; this component covers every case, including grids and dense forms.

## Parts

`Select.Control` groups `Select.Trigger` (with `SelectValue placeholder=`, and `variant="unstyled"` for hosts that draw their own frame, like a grid cell) and `Select.ClearTrigger`. `Select.Content` renders the portal and positioner, scroll buttons, and `SelectItem item=` rows with `Select.ItemText` and `Select.ItemIndicator`, grouped by `Select.ItemGroup` with `Select.ItemGroupLabel` and split by `Select.Separator`. `Select.HiddenSelect` adds a real form field.

## Notes

- Do not pass `id` to the trigger or content; use the root's `ids` prop when a label needs an `htmlFor` target.
- `Select.Context` and `Select.ItemContext` expose the machine and item state for custom rendering.
