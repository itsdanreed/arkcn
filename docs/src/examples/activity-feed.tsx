import { GitCommitIcon, MessageSquareIcon, UploadIcon } from "lucide-react"
import {
  ActivityFeed,
  ActivityFeedGroup,
  ActivityFeedGroupLabel,
  ActivityFeedItem,
  ActivityFeedItemActor,
  ActivityFeedItemBody,
  ActivityFeedItemContent,
  ActivityFeedItemHeader,
  ActivityFeedItemMarker,
  ActivityFeedItemTime,
  ActivityFeedItems,
} from "@/components/ui/activity-feed"

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
    <ActivityFeed className="w-full max-w-lg">
      {days.map((day) => (
        <ActivityFeedGroup key={day}>
          <ActivityFeedGroupLabel>{day}</ActivityFeedGroupLabel>
          <ActivityFeedItems>
            {items
              .filter((i) => i.day === day)
              .map((item) => (
                <ActivityFeedItem key={item.id} value={item.id}>
                  <ActivityFeedItemMarker>
                    <item.icon />
                  </ActivityFeedItemMarker>
                  <ActivityFeedItemContent>
                    <ActivityFeedItemHeader>
                      <ActivityFeedItemActor>{item.actor}</ActivityFeedItemActor>
                      <span>{item.summary}</span>
                      <ActivityFeedItemTime date={item.at} className="ms-auto" />
                    </ActivityFeedItemHeader>
                    {item.detail && <ActivityFeedItemBody>{item.detail}</ActivityFeedItemBody>}
                  </ActivityFeedItemContent>
                </ActivityFeedItem>
              ))}
          </ActivityFeedItems>
        </ActivityFeedGroup>
      ))}
    </ActivityFeed>
  )
}
