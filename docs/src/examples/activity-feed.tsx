import { GitCommitIcon, MessageSquareIcon, UploadIcon } from "lucide-react"
import { ActivityFeed } from "@/components/ui/activity-feed"

const hours = 3_600_000
const items = [
  {
    id: "1",
    actor: "Ava Chen",
    summary: "commented on Q3 report",
    detail: "Looks good, one question about the totals.",
    at: new Date(Date.now() - 2 * hours),
    icon: MessageSquareIcon,
    day: "Today",
  },
  {
    id: "2",
    actor: "Noah Patel",
    summary: "uploaded roadmap.pdf",
    at: new Date(Date.now() - 5 * hours),
    icon: UploadIcon,
    day: "Today",
  },
  {
    id: "3",
    actor: "Mia Torres",
    summary: "pushed 3 commits to main",
    at: new Date(Date.now() - 30 * hours),
    icon: GitCommitIcon,
    day: "Yesterday",
  },
]

export default function ActivityFeedExample() {
  const days = ["Today", "Yesterday"]
  return (
    <ActivityFeed.Root className="w-full max-w-lg">
      {days.map((day) => (
        <ActivityFeed.Group key={day}>
          <ActivityFeed.GroupLabel>{day}</ActivityFeed.GroupLabel>
          <ActivityFeed.Items>
            {items
              .filter((i) => i.day === day)
              .map((item) => (
                <ActivityFeed.Item key={item.id} value={item.id}>
                  <ActivityFeed.ItemMarker>
                    <item.icon />
                  </ActivityFeed.ItemMarker>
                  <ActivityFeed.ItemContent>
                    <ActivityFeed.ItemHeader>
                      <ActivityFeed.ItemActor>{item.actor}</ActivityFeed.ItemActor>
                      <span>{item.summary}</span>
                      <ActivityFeed.ItemTime date={item.at} className="ms-auto" />
                    </ActivityFeed.ItemHeader>
                    {item.detail && <ActivityFeed.ItemBody>{item.detail}</ActivityFeed.ItemBody>}
                  </ActivityFeed.ItemContent>
                </ActivityFeed.Item>
              ))}
          </ActivityFeed.Items>
        </ActivityFeed.Group>
      ))}
    </ActivityFeed.Root>
  )
}
