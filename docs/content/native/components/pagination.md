## How it works

Compose `Pagination.Root`, `FirstTrigger`, `PrevTrigger`, `Item`, `Ellipsis`, `NextTrigger`, and `LastTrigger`. `Context` exposes `pages` for rendering the numbered items. The controls reuse the standard native Button's 32px icon size, 14px typography, outline current-page treatment, ghost interactions, and focus ring. Colors follow the light/dark theme; transitions honor reduced motion.

`count` is the total number of records. Use `page` / `defaultPage` and `pageSize` / `defaultPageSize` for controlled or uncontrolled state. `onPageChange({ page, pageSize })` and `onPageSizeChange({ pageSize })` report changes. `siblingCount` and `boundaryCount` control the visible page range. The example reduces siblings and places its status on a second line when space is limited; control sizes stay unchanged.

`usePagination`, `RootProvider`, and `usePaginationContext` expose navigation actions, `setPage`, `setPageSize`, `pageRange` (zero-based start, exclusive end), and `slice(data)`. Out-of-range navigation is ignored. When the record count shrinks, the displayed page is clamped; uncontrolled state is updated and reports that change. Controlled callers own their page value. An empty result has no numbered items, an empty slice, and disabled navigation.

A disabled Root or Fieldset blocks navigation. Page controls expose their selected and disabled states to assistive technology; `translations` supplies labels and `dir` sets direction. Supply icon children to replace the default directional glyphs. Individual `onPress` callbacks can prevent the default page action.

`Content`, `Link`, `Previous`, and `Next` also support manually managed pagination. These are native Views and Buttons, not DOM links: connect `onPress` to your router or data source. `Previous` and `Next` hide their text below 640px like the web versions. There is no `asChild`, URL generation, DOM event, or browser-history API.
