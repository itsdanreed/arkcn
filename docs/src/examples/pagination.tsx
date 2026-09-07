import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function PaginationExample() {
  const [page, setPage] = React.useState(2)
  const go = (next: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setPage(Math.max(1, Math.min(5, next)))
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page === 1} />
          </PaginationItem>
          {[1, 2, 3, 4, 5].map((number) => (
            <PaginationItem key={number}>
              <PaginationLink href="#" onClick={go(number)} isActive={page === number}>
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page === 5} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of 5
      </p>
    </div>
  )
}
