import { View } from "react-native"
import { BoldIcon } from "lucide-react-native"
import { Toggle } from "@multicomma/arkcn-react-native/ui/toggle"
export default function ToggleExample() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Toggle.Root accessibilityLabel="Toggle bold">
        <BoldIcon /> Bold
      </Toggle.Root>
      <Toggle.Root variant="outline" defaultPressed accessibilityLabel="Toggle outline bold">
        <BoldIcon /> Bold
      </Toggle.Root>
      <Toggle.Root size="sm" disabled accessibilityLabel="Toggle disabled bold">
        <BoldIcon />
      </Toggle.Root>
      <Toggle.Root size="lg" variant="outline" accessibilityLabel="Toggle large bold">
        <BoldIcon />
      </Toggle.Root>
    </View>
  )
}
