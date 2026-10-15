import "@formatjs/intl-pluralrules/locale-data/de.js"
import "@formatjs/intl-relativetimeformat/locale-data/de.js"
import { useState } from "react"
import { Text, View } from "react-native"
import { Format } from "@/components/ui/format"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function FormatValidation() {
  const { colors, typography } = useNativeTheme()
  const [locale, setLocale] = useState("en-US")
  const [clock, setClock] = useState<"12h" | "24h">("12h")
  const textStyle = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }
  return (
    <Format.LocaleProvider locale={locale}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button variant="outline" onPress={() => setLocale(locale === "en-US" ? "de-DE" : "en-US")}>
            {locale}
          </Button>
          <Button variant="outline" onPress={() => setClock(clock === "12h" ? "24h" : "12h")}>
            {clock}
          </Button>
        </View>
        <Text style={textStyle}>
          Number: <Format.Number value={1234.56} />
        </Text>
        <Text style={textStyle}>
          Time: <Format.Time value="14:35:09" format={clock} withSeconds />
        </Text>
        <Text style={textStyle}>
          Relative: <Format.RelativeTime value={new Date(Date.now() - 3 * 3600000)} />
        </Text>
        <Text style={textStyle}>
          Binary bytes: <Format.Byte value={1024} unitSystem="binary" />
        </Text>
        <Text style={textStyle}>
          Explicit English: <Format.Number value={1234.56} locale="en-US" />
        </Text>
      </View>
    </Format.LocaleProvider>
  )
}
