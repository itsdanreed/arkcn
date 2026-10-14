import { Text, View } from "react-native"
import { ChevronsUpDown } from "lucide-react-native"
import { Collapsible } from "@multicomma/arkcn-react-native/ui/collapsible"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function CollapsibleExample() {
  const { colors, typography } = useNativeTheme()
  const text = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }
  const box = { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }
  return (
    <Collapsible.Root style={{ width: 320, maxWidth: "100%" }}>
      <View style={[box, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
        <Text style={[text, typography.medium]}>3 starred repositories</Text>
        <Collapsible.Trigger variant="ghost" size="icon-xs" accessibilityLabel="Toggle">
          <ChevronsUpDown size={12} color={colors.foreground} />
        </Collapsible.Trigger>
      </View>
      <Collapsible.Content style={{ marginTop: 8, gap: 8 }}>
        <Text style={[text, box]}>chakra-ui/ark</Text>
        <Text style={[text, box]}>tailwindlabs/tailwindcss</Text>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
