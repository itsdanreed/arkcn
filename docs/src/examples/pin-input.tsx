import * as React from "react"
import { PinInput } from "@/components/ui/pin-input"
export default function PinInputExample() {
  const [value, setValue] = React.useState<string[]>([])
  return (
    <PinInput.Root value={value} onValueChange={({ value }) => setValue(value)} otp>
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        {Array.from({ length: 6 }, (_, index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
      <PinInput.HiddenInput name="verification-code" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {value.join("").length === 6 ? "Code complete" : "Enter the six-digit code."}
      </p>
    </PinInput.Root>
  )
}
