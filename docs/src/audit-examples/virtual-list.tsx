import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { VirtualList, useVirtualList } from "@/components/ui/virtual-list"

export default function Example() {
  const [empty, setEmpty] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <VirtualList.Root count={empty ? 0 : 100} estimateSize={72} gap={16}>
        <Controls empty={empty} onEmpty={() => setEmpty(!empty)} />
        <VirtualList.Viewport
          tabIndex={0}
          aria-label="Records"
          className="mt-4 h-64 rounded-lg border"
          data-audit-part="viewport"
        >
          <VirtualList.Content>
            <VirtualList.Items>
              {(item) => (
                <VirtualList.Item index={item.index}>
                  <Item.Root data-audit-row={item.index}>
                    <Item.Content>
                      <Item.Title>Record {item.index + 1}</Item.Title>
                      <Item.Description>
                        {item.index % 3 === 0
                          ? "A longer description that wraps when the viewport becomes narrow."
                          : "Ready for review."}
                      </Item.Description>
                    </Item.Content>
                  </Item.Root>
                </VirtualList.Item>
              )}
            </VirtualList.Items>
          </VirtualList.Content>
          <VirtualList.Empty data-audit-part="empty" />
        </VirtualList.Viewport>
      </VirtualList.Root>
    </div>
  )
}
function Controls({ empty, onEmpty }: { empty: boolean; onEmpty: () => void }) {
  const list = useVirtualList()
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => list.scrollToIndex(0, { align: "start" })}>
        First
      </Button>
      <Button variant="outline" size="sm" onClick={() => list.scrollToIndex(99, { align: "end" })}>
        Last
      </Button>
      <Button variant="outline" size="sm" aria-pressed={empty} onClick={onEmpty}>
        Empty
      </Button>
    </div>
  )
}
