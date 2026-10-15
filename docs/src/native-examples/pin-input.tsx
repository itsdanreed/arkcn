import { useState } from "react"
import { Text } from "react-native"
import { PinInput } from "@multicomma/arkcn-react-native/ui/pin-input"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function PinInputExample() {
  const [value, setValue] = useState<string[]>([])
  const { colors, typography } = useNativeTheme()
  return (
    <PinInput.Root count={6} value={value} onValueChange={({ value }) => setValue(value)} otp>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        {Array.from({ length: 6 }, (_, index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
      <Text
        accessibilityLiveRegion="polite"
        style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}
      >
        {value.join("").length === 6 ? "Code complete" : "Enter the six-digit code."}
      </Text>
    </PinInput.Root>
  )
}
