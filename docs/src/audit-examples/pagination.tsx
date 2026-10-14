import { Pagination } from "@/components/ui/pagination"
import { LocaleProvider } from "@ark-ui/react"
export default function Example() {
  return (
    <div className="space-y-8">
      {(["ltr", "rtl"] as const).map((dir) => (
        <LocaleProvider key={dir} locale={dir === "rtl" ? "ar" : "en"}>
          <section dir={dir} data-audit-case={dir}>
            <Pagination.Root count={50} pageSize={10} defaultPage={2}>
              <Pagination.PrevTrigger aria-label="Previous">‹</Pagination.PrevTrigger>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pagination.Item key={value} type="page" value={value}>
                  {value}
                </Pagination.Item>
              ))}
              <Pagination.NextTrigger aria-label="Next">›</Pagination.NextTrigger>
            </Pagination.Root>
            <div className="mt-4 flex justify-center">
              <Pagination.Previous href="#previous" onClick={(e) => e.preventDefault()} />
              <Pagination.Next href="#next" onClick={(e) => e.preventDefault()} />
            </div>
          </section>
        </LocaleProvider>
      ))}
    </div>
  )
}
