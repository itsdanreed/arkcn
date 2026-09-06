## How it works

The data table is a set of parts on top of a small headless engine in `lib/table`. Column definitions are data only, `{ id | accessorKey | accessorFn, label, enableSorting, enableHiding, filterFn, sortingFn }`, with no render functions and no markup. `useDataTable` gives you a table instance with sorting, a global filter, per-column filters with faceted counts, pagination, row selection, and column visibility, all of it controllable.

You compose the markup yourself. `DataTableHead column=` renders the sort and hide menu for a sortable column, `DataTableBody` takes a render function that returns `DataTableCell column=` cells for one row, and the pagination parts read the instance from context. Cells whose column is hidden render nothing, so the view options menu works without any wiring in your row renderer.

## Toolbar

`DataTableSearch` drives the global filter. `DataTableFacetedFilter columnId=` is a multi-select filter with counts per option. `DataTableResetFilters` appears when anything is active. `DataTableViewOptions` toggles column visibility. Group them with `DataTableToolbarGroup`.

## Selection and bulk actions

`DataTableSelectAll` and `DataTableSelectRow` are checkbox cells. When rows are selected, `DataTableBulkActions` shows a floating toolbar at the bottom of the page with `DataTableBulkActionsCount`, your `DataTableBulkActionTrigger`s, and `DataTableBulkActionsClear`; a live region announces the count.

## Notes

- The engine is dependency free; the toolkit knows nothing about TanStack or any other table library.
- `DataTableRowActions` takes a `trigger` element rather than rendering a default button.
- For very large datasets, or for editing, use the data grid, which shares the same engine.
