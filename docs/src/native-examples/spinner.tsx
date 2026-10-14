import { Text, View } from "react-native"
import { Spinner } from "@multicomma/arkcn-react-native/ui/spinner"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function SpinnerExample() {
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Spinner.Root color={colors.mutedForeground} />
      <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
        Loading…
      </Text>
    </View>
  )
}
