import { View } from "react-native"
import { Terminal } from "lucide-react-native"
import { Alert } from "@multicomma/arkcn-react-native/ui/alert"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function AlertExample() {
  const { colors } = useNativeTheme()
  return (
    <View style={{ width: 384, maxWidth: "100%", gap: 12 }}>
      <Alert.Root icon={<Terminal size={16} color={colors.cardForeground} />}>
        <Alert.Title>Heads up!</Alert.Title>
        <Alert.Description>You can add components to your app using the CLI.</Alert.Description>
      </Alert.Root>
      <Alert.Root variant="destructive">
        <Alert.Title>Something went wrong</Alert.Title>
        <Alert.Description>Your session has expired. Please sign in again.</Alert.Description>
      </Alert.Root>
    </View>
  )
}
