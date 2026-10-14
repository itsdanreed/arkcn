import { useState } from "react"
import { ActivityFeed } from "@/components/ui/activity-feed"

export default function Example() {
  const [count, setCount] = useState(2)
  return (
    <div className="w-full max-w-lg space-y-6">
      <ActivityFeed.Root>
        <ActivityFeed.Items>
          {Array.from({ length: count }, (_, index) => (
            <ActivityFeed.Item
              key={index}
              value={String(index)}
              data-audit-part="row"
              aria-label={`Activity ${index + 1}`}
            >
              <ActivityFeed.ItemMarker />
              <ActivityFeed.ItemContent>
                <ActivityFeed.ItemHeader>
                  <ActivityFeed.ItemActor>Ava Chen</ActivityFeed.ItemActor>
                </ActivityFeed.ItemHeader>
                <ActivityFeed.ItemBody>Updated the project notes.</ActivityFeed.ItemBody>
              </ActivityFeed.ItemContent>
            </ActivityFeed.Item>
          ))}
        </ActivityFeed.Items>
      </ActivityFeed.Root>
      <div className="flex justify-center gap-2">
        <ActivityFeed.LoadMoreTrigger data-audit-part="load" onClick={() => setCount((n) => n + 1)} />
        <ActivityFeed.LoadMoreTrigger data-audit-part="disabled" disabled>
          Loading activity
        </ActivityFeed.LoadMoreTrigger>
      </div>
      <ActivityFeed.Empty data-audit-part="empty">No activity yet.</ActivityFeed.Empty>
    </div>
  )
}
