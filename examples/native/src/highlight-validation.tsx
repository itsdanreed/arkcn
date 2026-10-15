import { useState } from "react"
import { Text, View } from "react-native"
import { Button } from "@/components/ui/button"
import { Highlight } from "@/components/ui/highlight"
import { useNativeTheme } from "@/lib/theme"

export function HighlightValidation() {
  const [narrow, setNarrow] = useState(false)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ gap: 16 }}>
      <Button variant="outline" onPress={() => setNarrow(!narrow)}>
        {narrow ? "Widen text" : "Narrow text"}
      </Button>
      <Text style={{ ...typography.medium, fontSize: 14, color: colors.foreground }}>
        Wrapped phrase and repeated matches
      </Text>
      <View style={{ width: narrow ? 180 : 280, maxWidth: "100%", gap: 16 }}>
        <Highlight.Root
          text="Before a long matching phrase that wraps onto another line, after."
          query="a long matching phrase that wraps onto another line"
          selectable
        />
        <Highlight.Root text={"Ark UI, Ark UI.\nArk UI on another line."} query="Ark UI" matchAll />
        <Highlight.Root text="Centered matching text" query="matching" style={{ textAlign: "center" }} />
      </View>
    </View>
  )
}
