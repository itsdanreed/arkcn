import { Text, View } from "react-native"
import { Kbd } from "@multicomma/arkcn-react-native/ui/kbd"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

export default function KbdExample() {
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <Kbd.Group accessible accessibilityLabel="Command K">
        <Kbd.Root>⌘</Kbd.Root>
        <Kbd.Root>K</Kbd.Root>
      </Kbd.Group>
      <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
        to search
      </Text>
    </View>
  )
}
