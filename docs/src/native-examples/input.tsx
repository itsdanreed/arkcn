import { Text, View } from "react-native"
import { Input } from "@multicomma/arkcn-react-native/ui/input"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function InputExample() {
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ width: 288, maxWidth: "100%", gap: 8 }}>
      <Text style={{ ...typography.medium, fontSize: 14, lineHeight: 14, color: colors.foreground }}>Email</Text>
      <Input.Root
        accessibilityLabel="Email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  )
}
