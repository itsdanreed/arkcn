import {
  VirtualList,
  VirtualListContent,
  VirtualListItem,
  VirtualListItems,
  VirtualListViewport,
} from "@/components/ui/virtual-list"

export default function VirtualListExample() {
  return (
    <VirtualList count={100_000} estimateSize={32} className="w-80">
      <VirtualListViewport className="h-64 rounded-lg border">
        <VirtualListContent>
          <VirtualListItems>
            {(item) => (
              <VirtualListItem index={item.index} className="flex h-8 items-center border-b px-3 text-sm">
                Row {item.index + 1}
              </VirtualListItem>
            )}
          </VirtualListItems>
        </VirtualListContent>
      </VirtualListViewport>
    </VirtualList>
  )
}
