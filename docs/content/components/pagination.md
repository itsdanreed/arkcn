# Pagination

Pagination.Root owns the current page and page size. Supply count and pageSize, then render pages from Context with Item for page entries and Ellipsis for gaps.

PrevTrigger, NextTrigger, FirstTrigger, and LastTrigger update the page and disable themselves at the boundaries. Use page and onPageChange for controlled state, or defaultPage for uncontrolled state. Page controls support asChild when a router link is needed.

The root renders navigation semantics and the current page is marked for assistive technology. RootProvider accepts usePagination's return value.
