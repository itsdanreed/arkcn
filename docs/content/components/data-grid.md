## How it works

The data grid is a spreadsheet-style view over the same table engine the data table uses. You build a table with `useDataTable`, hand it to `DataGrid`, and describe each column's grid behaviour separately in the `columns` prop: the editor type (`text`, `number`, `boolean`, `select`, `date`), whether it is editable, its width, pinning, and optional `format` and `parse` functions.

The grid never mutates your data. Every commit fires `onCellChange({ row, columnId, value, previous })`, and you decide what to do with it. That keeps undo, validation, and saving in your hands. Rows are virtualized: only the visible window plus `overscan` rows are in the DOM, and every row has the fixed `rowHeight`.

## Editing

Click a cell, or move to it and press Enter, F2, or just start typing. Enter commits and moves down, Tab commits and moves right, Escape cancels. Boolean cells toggle with Space and render a `Checkbox`; select cells open the toolkit `Select`, never a native one. Scrolling closes an open editor so popups never drift away from their cell.

## Selection and clipboard

Arrow keys move the focused cell, Shift plus arrows extend a range, Home and End jump within the row, Ctrl or Cmd with Home and End jump to the corners, and Page Up and Page Down move a screen. Delete clears the range, Cmd or Ctrl+C copies it as tab-separated text, and Cmd or Ctrl+V pastes a block starting at the focused cell. A live region announces clears and copies.

## Parts

`DataGridContainer` is the scroll viewport. `DataGridHeader` holds a `DataGridHeaderRow` of `DataGridHead` cells, or `DataGridHeadWithResize` when you want drag-to-resize (double-click resets). `DataGridBody` takes a render function for one row and renders `DataGridCell column=` cells; cells keyed by a hidden column render nothing, so column visibility needs no extra wiring. `DataGridSelectAll` and `DataGridSelectRow` are checkbox cells for a `select` column.

## Notes

- Pinned columns are sticky with computed offsets; the header sits above them.
- Column widths are controllable through `columnSizing` and `onColumnSizingChange`.
- Give the grid a bounded height; it scrolls inside its container.
