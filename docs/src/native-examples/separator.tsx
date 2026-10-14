import { Text, View } from "react-native"
import { Separator } from "@multicomma/arkcn-react-native/ui/separator"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function SeparatorExample() {
  const { colors, typography } = useNativeTheme()
  const text = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }
  return (
    <View style={{ width: 288, maxWidth: "100%" }}>
      <Text style={[text, typography.medium]}>arkcn</Text>
      <Text style={[text, { color: colors.mutedForeground }]}>Components on Ark UI.</Text>
      <Separator.Root style={{ marginVertical: 16 }} />
      <View style={{ height: 20, flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Text style={text}>Docs</Text>
        <Separator.Root orientation="vertical" />
        <Text style={text}>Source</Text>
      </View>
    </View>
  )
}
