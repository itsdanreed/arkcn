import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
import { GitCommitIcon, MessageSquareIcon, UploadIcon } from "lucide-react-native"
import { ActivityFeed } from "@multicomma/arkcn-react-native/ui/activity-feed"

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
  const { colors } = useNativeTheme()
  const days = ["Today", "Yesterday"]
  return (
    <ActivityFeed.Root style={{ maxWidth: 512 }}>
      {days.map((day) => (
        <ActivityFeed.Group key={day}>
          <ActivityFeed.GroupLabel>{day}</ActivityFeed.GroupLabel>
          <ActivityFeed.Items>
            {items
              .filter((i) => i.day === day)
              .map((item) => (
                <ActivityFeed.Item key={item.id} value={item.id}>
                  <ActivityFeed.ItemMarker>
                    <item.icon size={16} color={colors.mutedForeground} />
                  </ActivityFeed.ItemMarker>
                  <ActivityFeed.ItemContent>
                    <ActivityFeed.ItemHeader>
                      <ActivityFeed.ItemActor>{item.actor}</ActivityFeed.ItemActor>
                      {item.summary}
                      <ActivityFeed.ItemTime date={item.at} style={{ marginStart: "auto" }} />
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
