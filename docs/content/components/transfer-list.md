## How it works

Two lists and a set of move triggers. The value is the target side, always kept in catalog order, so moving items never reorders them. The root owns the per-side search, ticks, and focus; you own the items and receive `onValueChange({ value, items, moved, direction })` after each move. Disabled items never move. Both lists are virtualized, so tens of thousands of items are fine.

## Parts

`TransferListPanel side=` is one list: a `TransferList.PanelHeader` with `TransferList.SelectAll` (ticks every visible enabled row, indeterminate when some are ticked), `TransferList.PanelTitle`, and `TransferList.PanelCount` ("selected / total"); `TransferList.Search`, which narrows what select-all and move-all touch; `TransferList.Items`, the listbox, with an optional render-prop child for the row label; and `TransferList.Empty`. `TransferList.Controls` sits between the panels with `TransferListMoveTrigger direction=` (the ticked items; disabled when none) and `TransferListMoveAllTrigger direction=` (every visible item), both polymorphic via `asChild`.

## Keyboard

Up and down move focus, Page Up and Page Down jump ten rows, Shift with arrows or Shift+click extends the ticks, Space ticks, Enter or double-click moves the focused item across, and Cmd or Ctrl+A ticks everything visible. A live region announces every move.
