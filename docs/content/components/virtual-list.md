## How it works

A dependency-free windowed list. Give it a `count` and an `estimateSize` (a number, or a function of the index); rows measure themselves with a ResizeObserver as they appear, and the estimates are replaced, so mixed row heights and a correct scrollbar come for free. Only the rows in view plus `overscan` are in the DOM.

## Parts

`VirtualListViewport` is the scroll container. Give it a height; it must never be `flex-1` inside an auto-height column, or it grows to the whole content and renders every row. `VirtualListContent` is sized to the total. `VirtualListItems` takes a render function that receives `{ index, key, start, size, measured }` and returns a `VirtualListItem index=`, which positions itself with a transform. `VirtualListEmpty` shows when the count is zero.

`useVirtualList()` exposes the rendered `items`, the `range`, the `totalSize`, `scrollToOffset`, and `scrollToIndex(index, { align })` with `auto`, `start`, `center`, or `end`. Instant scrolls flush the window synchronously, so you can focus a row right after scrolling to it, and a scroll to an unmeasured row re-aims a few times as the rows measure.

## Keyboard

Keyboard handling is the consumer's. The proven pattern is to keep focus on the viewport with `aria-activedescendant` naming the active row, or to keep roving focus on the rows and call `scrollToIndex` before focusing. The transfer list and tree select do the latter.
