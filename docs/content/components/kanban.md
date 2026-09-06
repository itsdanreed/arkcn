## How it works

You own the columns and cards; the board owns dragging. `Kanban` reports every move as an intent, `onCardMove({ cardId, fromColumnId, toColumnId, fromIndex, toIndex })` and `onColumnMove({ columnId, fromIndex, toIndex })`, and the `moveCard` and `moveColumn` helpers apply those to a `{ id, cards: { id }[] }[]` shape. Indices come from DOM order at drop time, so cards need no index prop.

## Parts

`KanbanBoard` scrolls horizontally and auto-scrolls near its edges. `KanbanColumn value=` is a drop target for cards and columns and can be dragged by its `KanbanColumnHandle` or header. Inside it, `KanbanColumnHeader` with `KanbanColumnTitle`, `KanbanColumnCount`, and `KanbanColumnActions`, then `KanbanColumnContent` for the cards and `KanbanColumnFooter` for an `KanbanAddTrigger`. `KanbanCard value=` is draggable, optionally only by its `KanbanCardHandle`, and composes `KanbanCardHeader`, `KanbanCardTitle`, `KanbanCardDescription`, and `KanbanCardFooter`.

While dragging, a `KanbanDropSlot` shows where the card will land, sized like the card, and the source card collapses. Column reordering shows a `KanbanDropIndicator` line. State is exposed as `data-dragging`, `data-over`, `data-target`, and `data-edge` attributes.

## Keyboard

Cards and handles are focusable. Space or Enter picks a card up, arrow keys move it within and between columns, Space or Enter drops it, Escape cancels, and focus follows the card. A live region announces each step.

## Notes

- Drag previews are crisp clones of the card, not the browser's blurred default.
- Native drag is Chrome's, so a collapsed source card keeps zero height instead of `display: none`, which would cancel the drag.
