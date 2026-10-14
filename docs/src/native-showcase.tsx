import { useState } from "react"
import { View } from "react-native"
import {
  Badge,
  Button,
  Card,
  Input,
  NativeThemeProvider,
  Separator,
  Skeleton,
  Spinner,
  Textarea,
  useNativeTheme,
} from "@multicomma/arkcn-react-native"

function Preview() {
  const [name, setName] = useState("")
  const [saved, setSaved] = useState(false)
  const { colors, spacing } = useNativeTheme()
  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg }}>
      <Card.Root>
        <Card.Header>
          <Badge.Root variant="secondary">Native primitives</Badge.Root>
          <Card.Title>Edit profile</Card.Title>
          <Card.Description>These components use React Native views, text, and touch controls.</Card.Description>
        </Card.Header>
        <Card.Content style={{ gap: spacing.md }}>
          <Input.Root
            accessibilityLabel="Display name"
            placeholder="Display name"
            value={name}
            onChangeText={(value) => {
              setName(value)
              setSaved(false)
            }}
          />
          <Textarea.Root accessibilityLabel="Bio" placeholder="A little about you" />
          <Separator.Root />
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Spinner.Root accessibilityLabel="Example loading indicator" />
            <Skeleton.Root style={{ width: 120, height: 16 }} />
          </View>
        </Card.Content>
        <Card.Footer style={{ flexWrap: "wrap", gap: spacing.sm }}>
          <Button disabled={!name.trim()} onPress={() => setSaved(true)}>
            Save profile
          </Button>
          <Button
            variant="outline"
            onPress={() => {
              setName("")
              setSaved(false)
            }}
          >
            Reset
          </Button>
          {saved && <Badge.Root accessibilityLiveRegion="polite">Saved {name}</Badge.Root>}
        </Card.Footer>
      </Card.Root>
    </View>
  )
}

export default function NativeShowcase() {
  const [scheme, setScheme] = useState<"light" | "dark">("light")
  return (
    <NativeThemeProvider colorScheme={scheme}>
      <View style={{ gap: 16 }}>
        <Button variant="outline" onPress={() => setScheme(scheme === "light" ? "dark" : "light")}>
          {scheme === "light" ? "Preview dark theme" : "Preview light theme"}
        </Button>
        <Preview />
      </View>
    </NativeThemeProvider>
  )
}
