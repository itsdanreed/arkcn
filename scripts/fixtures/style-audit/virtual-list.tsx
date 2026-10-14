import { useRef, useState } from "react"
import { Button } from "../ui/button"
import { Empty, EmptyDescription } from "../ui/empty"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../ui/item"

export default function Example() {
  const [empty, setEmpty] = useState(false)
  const viewport = useRef<HTMLDivElement>(null)
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => viewport.current?.scrollTo({ top: 0 })}>
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewport.current?.scrollTo({ top: viewport.current.scrollHeight })}
        >
          Last
        </Button>
        <Button variant="outline" size="sm" aria-pressed={empty} onClick={() => setEmpty(!empty)}>
          Empty
        </Button>
      </div>
      <div
        ref={viewport}
        tabIndex={0}
        aria-label="Records"
        className="h-64 overflow-y-auto rounded-lg border"
        data-audit-part="viewport"
      >
        {empty ? (
          <Empty data-audit-part="empty">
            <EmptyDescription>Nothing to show</EmptyDescription>
          </Empty>
        ) : (
          <ItemGroup>
            {Array.from({ length: 100 }, (_, index) => (
              <Item key={index} data-audit-row={index}>
                <ItemContent>
                  <ItemTitle>Record {index + 1}</ItemTitle>
                  <ItemDescription>
                    {index % 3 === 0
                      ? "A longer description that wraps when the viewport becomes narrow."
                      : "Ready for review."}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </div>
    </div>
  )
}
