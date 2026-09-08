# Date Picker

Compose DatePicker.Root with Label, Control, Input, and Trigger. Render Positioner and Content inside Portal.Root. The input and calendar share value and focus state.

Use View with day, month, and year modes. Context supplies weeks, weekdays, month grids, and year grids. TableCell carries the date or numeric month/year value; TableCellTrigger handles selection. ClearTrigger clears the value, and PresetTrigger selects a predefined range.

Arrow keys move the focused date. Enter selects it; Escape closes the calendar and restores focus. Use selectionMode for single, multiple, or range selection. RootProvider accepts the result of useDatePicker.
