import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../ui/pagination"
import { Button } from "../ui/button"
function Pages() {
  const [page, setPage] = useState(2)
  return (
    <Pagination>
      <PaginationContent>
        <Button
          variant="ghost"
          size="icon"
          disabled={page === 1}
          aria-label="Previous"
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </Button>
        {[1, 2, 3, 4, 5].map((value) => (
          <PaginationItem key={value}>
            <PaginationLink
              href="#page"
              isActive={value === page}
              onClick={(e) => {
                e.preventDefault()
                setPage(value)
              }}
            >
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <Button
          variant="ghost"
          size="icon"
          disabled={page === 5}
          aria-label="Next"
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </Button>
      </PaginationContent>
    </Pagination>
  )
}
export default function Example() {
  return (
    <div className="space-y-8">
      {(["ltr", "rtl"] as const).map((dir) => (
        <section key={dir} dir={dir} data-audit-case={dir}>
          <Pages />
          <div className="mt-4 flex justify-center">
            <PaginationPrevious href="#previous" onClick={(e) => e.preventDefault()} />
            <PaginationNext href="#next" onClick={(e) => e.preventDefault()} />
          </div>
        </section>
      ))}
    </div>
  )
}
