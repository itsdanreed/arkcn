import { useState } from "react"
import { Inbox } from "lucide-react-native"
import { Empty } from "@multicomma/arkcn-react-native/ui/empty"
import { Button } from "@multicomma/arkcn-react-native/ui/button"

export default function EmptyExample() {
  const [selected, setSelected] = useState(false)
  return (
    <Empty.Root style={{ width: 384, maxWidth: "100%" }}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Inbox />
        </Empty.Media>
        <Empty.Title>No messages</Empty.Title>
        <Empty.Description>When someone writes to you, it shows up here.</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" onPress={() => setSelected(true)}>
          Compose
        </Button>
        {selected && <Empty.Description accessibilityLiveRegion="polite">Compose selected</Empty.Description>}
      </Empty.Content>
    </Empty.Root>
  )
}
