import { useState } from "react"
import { Text, View } from "react-native"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function PasswordInputValidation() {
  const { colors, typography } = useNativeTheme()
  const [value, setValue] = useState("Demo-password-42")
  const [visible, setVisible] = useState(false)
  const [changes, setChanges] = useState(0)
  return (
    <View style={{ width: 360, maxWidth: "100%", gap: 20 }}>
      <PasswordInput.Root
        visible={visible}
        onVisibilityChange={({ visible }) => {
          setVisible(visible)
          setChanges((n) => n + 1)
        }}
      >
        <PasswordInput.Label>Controlled password</PasswordInput.Label>
        <PasswordInput.Control>
          <PasswordInput.Input value={value} onChangeText={setValue} />
          <PasswordInput.VisibilityTrigger />
        </PasswordInput.Control>
      </PasswordInput.Root>
      <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14 }}>
        {value.length} characters · {changes} visibility changes
      </Text>
      <Button
        variant="outline"
        size="sm"
        onPress={() => {
          setValue("Reset-password-7")
          setVisible(false)
        }}
      >
        Reset password
      </Button>
      {(["invalid", "disabled", "readOnly"] as const).map((mode) => (
        <PasswordInput.Root key={mode} {...{ [mode]: true }}>
          <PasswordInput.Label>
            {mode === "readOnly" ? "Read-only password" : `${mode[0].toUpperCase()}${mode.slice(1)} password`}
          </PasswordInput.Label>
          <PasswordInput.Control>
            <PasswordInput.Input defaultValue="Example-42" />
            <PasswordInput.VisibilityTrigger />
          </PasswordInput.Control>
        </PasswordInput.Root>
      ))}
    </View>
  )
}
