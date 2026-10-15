import { useState } from "react"
import { Text, View } from "react-native"
import { Message } from "@/components/ui/message"
import { Bubble } from "@/components/ui/bubble"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function MessageValidation() {
  const { colors, typography } = useNativeTheme()
  const [narrow, setNarrow] = useState(false)
  const [likes, setLikes] = useState(2)
  const [presses, setPresses] = useState(0)
  const [rtl, setRtl] = useState(false)
  return (
    <View style={{ gap: 24, width: "100%", maxWidth: 640 }}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Button variant="outline" onPress={() => setNarrow(!narrow)}>
          {narrow ? "Full width" : "Narrow conversation"}
        </Button>
        <Button variant="outline" onPress={() => setRtl(!rtl)}>
          {rtl ? "Left to right" : "Right to left"}
        </Button>
      </View>
      <Message.Group
        style={{ width: narrow ? 260 : "100%", maxWidth: "100%", gap: 32, direction: rtl ? "rtl" : "ltr" }}
      >
        <Message.Root>
          <Message.Avatar>
            <Avatar.Root>
              <Avatar.Fallback>AC</Avatar.Fallback>
            </Avatar.Root>
          </Message.Avatar>
          <Message.Content>
            <Message.Header>Ava Chen</Message.Header>
            <Bubble.Root variant="secondary" style={{ marginBottom: 20 }}>
              <Bubble.Content>
                This longer message should wrap naturally, with the avatar beside the message and room for its timestamp
                below.
              </Bubble.Content>
              <Bubble.Reactions align="start" interactive>
                <Button
                  variant="ghost"
                  size="xs"
                  accessibilityLabel={`Like message, ${likes} likes`}
                  onPress={() => setLikes(likes + 1)}
                >
                  <Text>👍</Text>
                  <Text style={{ ...typography.regular, color: colors.foreground, fontSize: 12 }}>{likes}</Text>
                </Button>
              </Bubble.Reactions>
            </Bubble.Root>
            <Message.Footer>9:12 AM · Delivered</Message.Footer>
          </Message.Content>
        </Message.Root>
        <Message.Root align="end">
          <Message.Content>
            <Message.Header>You</Message.Header>
            <Bubble.Root>
              <Bubble.Content>Thanks! I’ll take a look.</Bubble.Content>
            </Bubble.Root>
            <Message.Footer>9:15 AM · Read</Message.Footer>
          </Message.Content>
        </Message.Root>
        <Message.Root>
          <Message.Content>
            <Message.Header>Plain message</Message.Header>
            <Bubble.Root variant="ghost">
              <Bubble.Content>No surface here. The header and footer align with the text.</Bubble.Content>
            </Bubble.Root>
            <Message.Footer>9:16 AM</Message.Footer>
          </Message.Content>
        </Message.Root>
        {(["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const).map((variant) => (
          <Bubble.Root key={variant} variant={variant}>
            <Bubble.Content onPress={() => setPresses(presses + 1)} accessibilityLabel={`${variant} message`}>
              {variant} · Tap this message
            </Bubble.Content>
          </Bubble.Root>
        ))}
        <Bubble.Root variant="outline">
          <Bubble.Content disabled onPress={() => setPresses(presses + 1)}>
            Disabled message
          </Bubble.Content>
        </Bubble.Root>
        <Bubble.Root variant="tinted">
          <Bubble.Content>Top reaction</Bubble.Content>
          <Bubble.Reactions side="top" align="start">
            ✓ 1
          </Bubble.Reactions>
        </Bubble.Root>
      </Message.Group>
      <Text style={{ ...typography.regular, fontSize: 14, color: colors.foreground }}>Message presses: {presses}</Text>
    </View>
  )
}
