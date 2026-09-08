## How it works

You own the columns and cards; the board owns dragging. `Kanban.Root` reports every move as an intent, `onCardMove({ cardId, fromColumnId, toColumnId, fromIndex, toIndex })` and `onColumnMove({ columnId, fromIndex, toIndex })`, and the `moveCard` and `moveColumn` helpers apply those to a `{ id, cards: { id }[] }[]` shape. Indices come from DOM order at drop time, so cards need no index prop.

## Parts

`Kanban.Board` scrolls horizontally and auto-scrolls near its edges. `KanbanColumn value=` is a drop target for cards and columns and can be dragged by its `Kanban.ColumnHandle` or header. Inside it, `Kanban.ColumnHeader` with `Kanban.ColumnTitle`, `Kanban.ColumnCount`, and `Kanban.ColumnActions`, then `Kanban.ColumnContent` for the cards and `Kanban.ColumnFooter` for an `Kanban.AddTrigger`. `KanbanCard value=` is draggable, optionally only by its `Kanban.CardHandle`, and composes `Kanban.CardHeader`, `Kanban.CardTitle`, `Kanban.CardDescription`, and `Kanban.CardFooter`.

While dragging, a `Kanban.DropSlot` shows where the card will land, sized like the card, and the source card collapses. Column reordering shows a `Kanban.DropIndicator` line. State is exposed as `data-dragging`, `data-over`, `data-target`, and `data-edge` attributes.

## Keyboard

Cards and handles are focusable. Space or Enter picks a card up, arrow keys move it within and between columns, Space or Enter drops it, Escape cancels, and focus follows the card. A live region announces each step.

## Notes

- Drag previews are crisp clones of the card, not the browser's blurred default.
- Native drag is Chrome's, so a collapsed source card keeps zero height instead of `display: none`, which would cancel the drag.
