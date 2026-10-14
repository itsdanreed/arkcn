import { useState } from "react"
import { Button } from "../ui/button"
import { Empty, EmptyDescription } from "../ui/empty"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../ui/item"

export default function Example() {
  const [count, setCount] = useState(2)
  return (
    <div className="w-full max-w-lg space-y-6">
      <ItemGroup>
        {Array.from({ length: count }, (_, index) => (
          <Item key={index} tabIndex={0} data-audit-part="row" aria-label={`Activity ${index + 1}`}>
            <ItemContent>
              <ItemTitle>Ava Chen</ItemTitle>
              <ItemDescription>Updated the project notes.</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" data-audit-part="load" onClick={() => setCount((n) => n + 1)}>
          Load older activity
        </Button>
        <Button variant="outline" size="sm" data-audit-part="disabled" disabled>
          Loading activity
        </Button>
      </div>
      <Empty data-audit-part="empty">
        <EmptyDescription>No activity yet.</EmptyDescription>
      </Empty>
    </div>
  )
}
