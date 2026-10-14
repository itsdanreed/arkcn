import { Mail } from "lucide-react-native"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
import { View } from "react-native"
import { Button } from "@multicomma/arkcn-react-native/ui/button"

export default function ButtonExample() {
  const { colors } = useNativeTheme()
  return (
    <View style={{ maxWidth: "100%", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
      <Button variant="outline" invalid>
        Invalid
      </Button>
      <Button variant="outline" accessibilityState={{ expanded: true }}>
        Expanded
      </Button>
      <Button size="sm">
        <Mail size={14} color={colors.primaryForeground} />
        Email
      </Button>
      <Button size="icon" accessibilityLabel="Email">
        <Mail size={16} color={colors.primaryForeground} />
      </Button>
    </View>
  )
}
