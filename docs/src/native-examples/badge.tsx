import { View } from "react-native"
import { Badge } from "@multicomma/arkcn-react-native/ui/badge"

export default function BadgeExample() {
  return (
    <View style={{ maxWidth: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Badge.Root>Default</Badge.Root>
      <Badge.Root variant="secondary">Secondary</Badge.Root>
      <Badge.Root variant="outline">Outline</Badge.Root>
      <Badge.Root variant="destructive">Destructive</Badge.Root>
    </View>
  )
}
