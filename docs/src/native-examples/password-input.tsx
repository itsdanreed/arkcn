import { PasswordInput } from "@multicomma/arkcn-react-native/ui/password-input"

export default function PasswordInputExample() {
  return (
    <PasswordInput.Root style={{ width: 288, maxWidth: "100%" }}>
      <PasswordInput.Label>Password</PasswordInput.Label>
      <PasswordInput.Control>
        <PasswordInput.Input placeholder="••••••••" />
        <PasswordInput.VisibilityTrigger />
      </PasswordInput.Control>
    </PasswordInput.Root>
  )
}
