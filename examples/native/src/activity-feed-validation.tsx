import { useState } from "react"
import { Text, View } from "react-native"
import { ActivityFeed } from "@/components/ui/activity-feed"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

const now = new Date("2026-10-14T12:00:00Z")
export function ActivityFeedValidation() {
  const [count, setCount] = useState(1)
  const [narrow, setNarrow] = useState(false)
  const [rtl, setRtl] = useState(false)
  const [replies, setReplies] = useState(0)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ gap: 16, alignItems: "center" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button variant="outline" onPress={() => setNarrow(!narrow)}>
          {narrow ? "Full width" : "Narrow feed"}
        </Button>
        <Button variant="outline" onPress={() => setRtl(!rtl)}>
          {rtl ? "Left to right" : "Right to left"}
        </Button>
        <Button variant="outline" onPress={() => setCount(0)}>
          Clear activity
        </Button>
        <Button variant="outline" onPress={() => setCount(1)}>
          Reset activity
        </Button>
      </View>
      <ActivityFeed.Root dir={rtl ? "rtl" : "ltr"} style={{ maxWidth: narrow ? 280 : 512 }}>
        <ActivityFeed.Group>
          <ActivityFeed.GroupLabel>Updates</ActivityFeed.GroupLabel>
          <ActivityFeed.Items>
            {Array.from({ length: count }, (_, index) => (
              <ActivityFeed.Item value={`event-${index}`} key={index}>
                <ActivityFeed.ItemMarker />
                <ActivityFeed.ItemContent>
                  <ActivityFeed.ItemHeader>
                    <ActivityFeed.ItemActor>{index ? "Noah Patel" : "Ava Chen"}</ActivityFeed.ItemActor>
                    {"reviewed the latest project changes"}
                    <ActivityFeed.ItemTime date={new Date(now.getTime() - (index + 1) * 3600000)} now={now} />
                  </ActivityFeed.ItemHeader>
                  <ActivityFeed.ItemBody>
                    A longer activity detail wraps naturally, with the connector continuing to the next marker.
                  </ActivityFeed.ItemBody>
                  <ActivityFeed.ItemActions>
                    <Button variant="ghost" size="xs" onPress={() => setReplies(replies + 1)}>
                      Reply to event {index + 1}
                    </Button>
                  </ActivityFeed.ItemActions>
                </ActivityFeed.ItemContent>
              </ActivityFeed.Item>
            ))}
          </ActivityFeed.Items>
          {!count && (
            <ActivityFeed.Empty>
              <ActivityFeed.ItemBody>No activity yet.</ActivityFeed.ItemBody>
            </ActivityFeed.Empty>
          )}
        </ActivityFeed.Group>
        <ActivityFeed.LoadMoreTrigger disabled={count >= 3} onPress={() => setCount(count + 1)} />
      </ActivityFeed.Root>
      <Text style={{ ...typography.regular, fontSize: 14, color: colors.mutedForeground }}>Replies: {replies}</Text>
    </View>
  )
}
