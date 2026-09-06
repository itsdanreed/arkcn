## How it works

A popover picker over a tree collection, built on the tree view. Single mode picks one leaf; set `selectableBranches` to let a branch itself be the answer instead of expanding. Multiple mode uses checkbox semantics: the value holds leaf values only, ticking a branch ticks every leaf under it, and a fully selected branch shows as one chip, so "Engineering" stands in for everyone in it. The value is always a `string[]` and is controllable, as are the expanded branches and the open state.

The tree inside the popup is virtualized: only the expanded nodes that are in view are in the DOM, so trees with thousands of nodes open instantly. Keyboard navigation scrolls rows into view before focusing them.

## Parts

`TreeSelectTrigger` is a focusable combobox: Enter, Space, or Down opens it, and Backspace removes the last chip in multiple mode. Inside it, `TreeSelectValue` shows labels as text, or `TreeSelectChips` shows removable `TreeSelectChip` elements, followed by `TreeSelectClearTrigger` and `TreeSelectIndicator`. `TreeSelectContent` matches the trigger's width and holds `TreeSelectSearch` (filters the collection keeping ancestors, auto-expands matches, Down moves into the tree), `TreeSelectTree` (a render-prop child customises the row label), and `TreeSelectEmpty`. `TreeSelectHiddenInput name=` adds inputs for native forms.

## Notes

- `collapseValues(collection, value)` is the helper that turns leaf values into the top-most fully selected nodes.
- Close behaviour follows `closeOnSelect`, which defaults to closed after a pick in single mode and open in multiple mode.
