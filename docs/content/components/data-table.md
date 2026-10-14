## How it works

The data table is a set of parts on top of a small headless engine in `lib/table`. Column definitions are data only, `{ id | accessorKey | accessorFn, label, enableSorting, enableHiding, filterFn, sortingFn }`, with no render functions and no markup. `useDataTable` gives you a table instance with sorting, a global filter, per-column filters with faceted counts, pagination, row selection, and column visibility, all of it controllable.

You compose the markup yourself. `DataTableHead column=` renders the sort and hide menu for a sortable column, `DataTable.Body` takes a render function that returns `DataTableCell column=` cells for one row, and the pagination parts read the instance from context. Cells whose column is hidden render nothing, so the view options menu works without any wiring in your row renderer.

## Sticky columns

Pass column IDs to `DataTable.Table` to keep them visible during horizontal scrolling:

```tsx
<DataTable.Table stickyColumns={{ left: ["select", "name"], right: ["actions"] }}>
  {/* Matching DataTable.Head and DataTable.Cell parts need column="...". */}
</DataTable.Table>
```

Render left-pinned columns first and right-pinned columns last in your header and rows. The table keeps your
markup order. Offsets use measured header widths and update when columns resize or hide, so multiple sticky
columns do not overlap. Give the table a minimum width when you want horizontal scrolling in a narrow container.
`left` and `right` refer to physical edges, including in RTL layouts. Use each column in only one group.

Pinned cells have opaque backgrounds that follow row hover, selection, expansion, and row-drag states. For a
custom table surface, set `--table-sticky-bg` on the table, header, or row to its opaque background color. Custom
multi-row/grouped headers and spanning cells need their own layout; automatic offsets expect one header per column.

## Toolbar

`DataTable.Search` drives the global filter. `DataTableFacetedFilter columnId=` is a multi-select filter with counts per option. `DataTable.ResetFilters` appears when anything is active. `DataTable.ViewOptions` toggles column visibility. Group them with `DataTable.ToolbarGroup`.

## Selection and bulk actions

`DataTable.SelectAll` and `DataTable.SelectRow` are checkbox cells. When rows are selected, `DataTable.BulkActions` shows a floating toolbar at the bottom of the page with `DataTable.BulkActionsCount`, your `DataTable.BulkActionTrigger`s, and `DataTable.BulkActionsClear`; a live region announces the count.

## Reordering rows

Pass `onRowReorder` to `DataTable.Root` and put a `DataTable.RowHandle` in a cell of each row. Dragging a handle moves its row; dropping reports `{ rowId, targetId, edge }`, the moved row and the row it landed above or below. Apply it to your own data, for example with `reorderRowIds(ids, details)`. From the keyboard, focus a handle, press Space to pick the row up, use the arrow keys to move it, and press Space again to drop it; each step is announced. Reorder only an unsorted, unfiltered view, since the order you see is the order you store.

## Notes

- The engine is dependency free; the toolkit knows nothing about TanStack or any other table library.
- `DataTable.RowActions` takes a `trigger` element rather than rendering a default button.
- For very large datasets, or for editing, use the data grid, which shares the same engine.
