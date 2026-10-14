## How it works

The spreadsheet is a sheet of cells with column letters and row numbers, not a table of records. You hand `Spreadsheet.Root` the cells as rows of values (`string`, `number`, `boolean`, or `null`) and it owns everything that is not data: the selection, the editing draft, column widths, the scroll window, and an undo stack. Rows are virtualized at a fixed `rowHeight`, so ten thousand rows cost the same as thirty.

The sheet never mutates your data. Every edit, paste, clear, fill, undo, and redo arrives as one batch through `onCellsChange([{ row, column, value, previous }])`, and you apply it. Replace the `data` array (and the changed rows) so the sheet notices; formulas are re-evaluated lazily from the new data.

## Formulas

A cell whose text starts with `=` is a formula. The built-in layer in `lib/formula.ts` understands cell references (`A1`, `$B$2`), ranges (`A1:B3`), `+ - * / ^`, parentheses, unary minus, numbers, quoted strings, and `SUM`, `AVERAGE`, `MIN`, `MAX`, and `COUNT`. Pass `functions` to add your own by upper-case name. A reference outside the sheet shows `#REF!`, a cell that depends on itself `#CYCLE!`, an unknown function `#NAME?`, bad syntax `#ERROR!`, text in arithmetic `#VALUE!`, and division by zero `#DIV/0!`. Cells expose `data-formula`, `data-type` (`text`, `number`, `boolean`, `error`), and `data-error`.

## Editing

Double-click a cell, or move to it and press Enter, F2, or just start typing. Enter commits and moves down, Tab commits and moves right, Escape cancels. `Spreadsheet.FormulaInput` edits the same draft from the formula bar, and `Spreadsheet.NameBox` shows the focused cell or the selected range. Empty text becomes `null` and numeric text becomes a number; everything else, formulas included, stays text.

## Selection and clipboard

Click or arrow to a cell, Shift+arrows or Shift+click extend a range, and dragging across cells selects them (the viewport scrolls when you reach an edge). Clicking a column letter or row number selects the whole line, the corner selects everything, and ⌘A, Shift+Space, and Ctrl+Space do the same from the keyboard. ⌘ or Ctrl with an arrow jumps to the edge, Home and End move within the row, and Page Up and Page Down move a screen.

Delete clears the range. ⌘C copies the displayed values as tab-separated text, ⌘X copies and clears, and ⌘V pastes a block from the focused cell, or fills the whole selection when the clipboard holds a single value. ⌘Z and ⇧⌘Z undo and redo by replaying the inverse intents through `onCellsChange`; `Spreadsheet.UndoTrigger` and `Spreadsheet.RedoTrigger` do the same from buttons.

## Fill handle

The small square at the bottom-right of the selection is the fill handle. Drag it down, up, left, or right to extend the selection's values into the neighbouring cells: a column or row of numbers with a constant step continues the series, anything else repeats the pattern, and formulas shift their relative references (`=B2*C2` filled one row down becomes `=B3*C3`; `$` pins a part).

## Parts

`Spreadsheet.Container` is the scroll viewport and the keyboard target (a `role="grid"` with `aria-activedescendant`). `Spreadsheet.Header` is the sticky block holding `Spreadsheet.HeaderRow` (the corner and one `Spreadsheet.ColumnHeader` per column, each with a `Spreadsheet.ResizeHandle`: drag to resize, double-click to reset) and any `frozenRows`. `Spreadsheet.Body` renders the windowed rows; by default each is a `Spreadsheet.Row` with a `Spreadsheet.RowHeader` and a `Spreadsheet.Cell` per column, and a render function child replaces that. `Spreadsheet.Empty` shows when there are no rows or columns.

## Notes

- `frozenRows` and `frozenColumns` stay in view while scrolling; the row-number gutter is always sticky.
- Give the sheet a bounded height; it scrolls inside its container.
- Column widths are controllable through `columnWidths` and `onColumnWidthsChange`; the selection through `selection` and `onSelectionChange`.
- `readOnly` keeps navigation, selection, and copy but disables editing, clearing, pasting, and the fill handle.
