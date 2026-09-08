import { Pagination } from "@/components/ui/pagination"
export default function PaginationExample() {
  return (
    <div className="flex flex-col gap-4">
      <Pagination.Root count={100} pageSize={10} defaultPage={2}>
        <Pagination.FirstTrigger aria-label="First page">«</Pagination.FirstTrigger>
        <Pagination.PrevTrigger aria-label="Previous page">‹</Pagination.PrevTrigger>
        <Pagination.Context>
          {(api) => (
            <>
              {api.pages.map((page, index) =>
                page.type === "page" ? (
                  <Pagination.Item key={page.value} {...page}>
                    {page.value}
                  </Pagination.Item>
                ) : (
                  <Pagination.Ellipsis key={index} index={index}>
                    …
                  </Pagination.Ellipsis>
                )
              )}
            </>
          )}
        </Pagination.Context>
        <Pagination.NextTrigger aria-label="Next page">›</Pagination.NextTrigger>
        <Pagination.LastTrigger aria-label="Last page">»</Pagination.LastTrigger>
        <Pagination.Context>
          {(api) => (
            <span className="ml-3 text-sm text-muted-foreground" aria-live="polite">
              Page {api.page} of {api.totalPages}
            </span>
          )}
        </Pagination.Context>
      </Pagination.Root>
    </div>
  )
}
