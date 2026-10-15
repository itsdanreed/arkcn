import { useState } from "react"
import { Text, View } from "react-native"
import { FileTextIcon } from "lucide-react-native"
import { Item } from "@multicomma/arkcn-react-native/ui/item"
import { Button } from "@multicomma/arkcn-react-native/ui/button"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function ItemExample() {
  const [selected, setSelected] = useState(false)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ width: 384, maxWidth: "100%", gap: 8 }}>
      <Item.Root variant="outline">
        <Item.Media variant="icon">
          <FileTextIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>Quarterly report.pdf</Item.Title>
          <Item.Description>2.4 MB · uploaded yesterday</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button variant="outline" size="sm" onPress={() => setSelected(true)}>
            Download
          </Button>
        </Item.Actions>
      </Item.Root>
      {selected && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}
        >
          Download selected. Connect this action to your file URL.
        </Text>
      )}
    </View>
  )
}
