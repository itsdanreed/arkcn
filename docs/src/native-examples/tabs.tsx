import { Text } from "react-native"
import { Tabs } from "@multicomma/arkcn-react-native/ui/tabs"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function TabsExample() {
  const { colors, typography } = useNativeTheme()
  const text = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }
  return (
    <Tabs.Root defaultValue="account" style={{ width: 320, maxWidth: "100%" }}>
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <Text style={text}>Make changes to your account here.</Text>
      </Tabs.Content>
      <Tabs.Content value="password">
        <Text style={text}>Change your password here.</Text>
      </Tabs.Content>
    </Tabs.Root>
  )
}
