## How it works

A screen-reader announcer for actions with no visible feedback: a card moved, a range cleared, an item transferred. `useLiveRegion()` returns `{ message, announce }`; `announce` re-fires even when the same text is announced twice, and `clearAfter` empties the region after a delay so stale text is not read to someone who lands on it later. `LiveRegion message=` renders the visually hidden `role="status"` element; pass `assertive` for `role="alert"`.

Every data primitive in the toolkit renders its own `LiveRegion.Root`, so they work without any provider. Use the same pair in your own components rather than a bespoke hidden div.
