import { useState } from "react"
import { View } from "react-native"
import { Highlight } from "@multicomma/arkcn-react-native/ui/highlight"
import { Input } from "@multicomma/arkcn-react-native/ui/input"

export default function HighlightExample() {
  const [query, setQuery] = useState("components")
  return (
    <View style={{ width: 320, maxWidth: "100%", gap: 16 }}>
      <Input.Root accessibilityLabel="Highlight text" value={query} onChangeText={setQuery} />
      <Highlight.Root query={query} text="Compose accessible components with Ark UI components." />
    </View>
  )
}
