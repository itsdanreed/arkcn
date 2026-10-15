import { useState } from "react"
import { Text, View } from "react-native"
import { PinInput } from "@/components/ui/pin-input"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"
export function PinInputValidation() {
  const [value, setValue] = useState<string[]>([])
  const [completions, setCompletions] = useState(0)
  const [invalid, setInvalid] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={{ ...typography.medium, fontSize: 18, color: colors.foreground }}>
        Pin Input checks
      </Text>
      <PinInput.Root
        count={4}
        value={value}
        onValueChange={({ value }) => setValue(value)}
        onValueComplete={() => setCompletions((n) => n + 1)}
        onValueInvalid={() => setInvalid(true)}
        invalid={invalid}
        disabled={disabled}
      >
        <PinInput.Label>Test code</PinInput.Label>
        <PinInput.Control>
          {Array.from({ length: 4 }, (_, index) => (
            <PinInput.Input key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
      <Text accessibilityLiveRegion="polite" style={{ ...typography.regular, fontSize: 14, color: colors.foreground }}>
        Value: {value.map((v) => v || "_").join("") || "____"}; completions: {completions}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          variant="outline"
          onPress={() => {
            setValue([])
            setCompletions(0)
            setInvalid(false)
          }}
        >
          Reset code
        </Button>
        <Button variant="outline" onPress={() => setValue(["9", "8", "7", "6"])}>
          Set code
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "Enable code" : "Disable code"}
        </Button>
        <Button variant="outline" onPress={() => setInvalid(!invalid)}>
          Toggle invalid
        </Button>
      </View>
    </View>
  )
}
