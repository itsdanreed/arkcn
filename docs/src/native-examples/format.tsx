import { Text, View } from "react-native"
import { Format } from "@multicomma/arkcn-react-native/ui/format"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

export default function FormatExample() {
  const { colors, typography } = useNativeTheme()
  const textStyle = { ...typography.regular, fontSize: 14, lineHeight: 20 }
  const rows = [
    ["Number", <Format.Number key="number" value={1234567.891} maximumFractionDigits={2} />],
    ["Currency", <Format.Number key="currency" value={49.99} style="currency" currency="USD" />],
    ["Bytes", <Format.Byte key="bytes" value={1_450_000} />],
    ["Relative", <Format.RelativeTime key="relative" value={new Date(Date.now() - 3 * 3600 * 1000)} />],
  ] as const
  return (
    <Format.LocaleProvider locale="en-US">
      <View style={{ flexDirection: "row", gap: 24 }}>
        <View style={{ gap: 4 }}>
          {rows.map(([label]) => (
            <Text key={label} style={[textStyle, { color: colors.mutedForeground }]}>
              {label}
            </Text>
          ))}
        </View>
        <View style={{ gap: 4 }}>
          {rows.map(([label, value]) => (
            <Text key={label} style={[textStyle, { color: colors.foreground }]}>
              {value}
            </Text>
          ))}
        </View>
      </View>
    </Format.LocaleProvider>
  )
}
