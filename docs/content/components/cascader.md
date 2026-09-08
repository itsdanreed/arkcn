## How it works

A picker for hierarchical choices that drills through columns and shows the answer as a path, like "United States / California / San Francisco". It runs on a tree collection and a popover. The value is a `string[]` holding the selected node, and `onValueChange` also receives the path of nodes from the first level down. Picking a leaf closes the popup; picking a branch opens the next column, and with `changeOnSelect` the branch itself becomes the value while the popup stays open. Opening starts from the current value's path, so the user sees where they are.

## Parts

`Cascader.Trigger` is a focusable combobox with `Cascader.Value` (the path, with a custom `separator` or a render-prop child), `Cascader.ClearTrigger`, and `Cascader.Indicator`. `Cascader.Content` owns the keyboard: up and down move within a column, right opens a branch, left returns to the parent, Home and End jump, Enter or Space activates. `Cascader.Search` matches every level; while it has text, `Cascader.SearchResults` replaces the columns with a flat list of `Cascader.SearchResult` paths, and with the search empty, left and right still move across columns. `Cascader.Columns` renders one `CascaderColumn depth=` per open level of `CascaderItem node=` rows, each with `Cascader.ItemText` and a `Cascader.ItemIndicator` that shows a chevron on branches and a check on the selected leaf. `Cascader.Empty` and `Cascader.HiddenInput` complete the set.

## Notes

- `expandTrigger="hover"` opens the next column on hover instead of click.
- Items expose `data-branch`, `data-expanded`, `data-selected`, `data-highlighted`, and `data-disabled` for styling.
