## How it works

A compositional timeline with solid connectors, inline event details, and matching light/dark tokens.

`Root`, `Group`, `GroupLabel`, `Items`, `Item`, `ItemMarker`, `ItemContent`, `ItemHeader`, `ItemActor`, `ItemTime`, `ItemBody`, `ItemActions`, `LoadMoreTrigger`, and `Empty` mirror the web anatomy. Use native `style` and `onPress` props; there is no DOM `asChild`.

Map events directly inside `Items`. Arrays, fragments, and conditional children are supported. Each item connects to the next marker, and the last item has no trailing line. Set `Items gap` to adjust spacing and connector length together. If a custom component renders multiple items, set each `Item last` explicitly. `Root dir` overrides the system direction.

`ItemHeader` wraps plain string children in muted 14px text; `ItemActor` uses medium weight. Explicit native `Text` children need their own styling. `ItemBody` is a native Text for paragraphs and inline text; put complex layouts in `ItemContent`. Markers accept an Avatar or a 16px icon with `colors.mutedForeground`; an empty marker renders a dot. Details remain inline without a card surface.

`ItemTime` uses the same shared relative-time formatter as web. Pass `now` for a stable reference and `locale` for localization; full dates are available as an accessibility hint. English relative-time polyfills are included for Hermes. Import additional FormatJS locale data for other languages. Times refresh on render, so the consumer owns any refresh interval.

`busy` exposes loading state. `LoadMoreTrigger` uses the standard outline Button; supply `disabled` and `onPress` for loading or pagination. Events, requests, scrolling, and virtualization remain consumer-owned. This component is intended for bounded timelines; use a virtualized native list for large histories.

Native accessibility uses feed/list/article roles where supported and leaves nested action buttons reachable. Web PageUp/PageDown and Ctrl+Home/End navigation is not implemented on native. Keyboard focus styling uses a 100ms border transition and respects reduced motion. Adding events does not animate or shift existing content through layout animations, matching the audited web feed.
