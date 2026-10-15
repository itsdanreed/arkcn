import { Text, View } from "react-native"
import { ScrollArea } from "@multicomma/arkcn-react-native/ui/scroll-area"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

const tags = Array.from({ length: 30 }, (_, i) => `v1.${i}.0`)
export default function ScrollAreaExample() {
  const { colors, typography, radius } = useNativeTheme()
  return (
    <ScrollArea.Root
      style={{ height: 224, width: 192, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}
    >
      <View style={{ padding: 12 }}>
        <Text style={{ ...typography.medium, fontSize: 14, lineHeight: 20, color: colors.foreground, marginBottom: 8 }}>
          Tags
        </Text>
        {tags.map((tag, index) => (
          <View
            key={tag}
            style={{
              paddingVertical: 6,
              borderBottomWidth: index === tags.length - 1 ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }}>{tag}</Text>
          </View>
        ))}
      </View>
    </ScrollArea.Root>
  )
}
