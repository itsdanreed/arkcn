import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputInput,
  PasswordInputLabel,
  PasswordInputVisibilityTrigger,
} from "@/components/ui/password-input"

export default function PasswordInputExample() {
  return (
    <PasswordInput className="w-72">
      <PasswordInputLabel>Password</PasswordInputLabel>
      <PasswordInputControl>
        <PasswordInputInput placeholder="••••••••" />
        <PasswordInputVisibilityTrigger />
      </PasswordInputControl>
    </PasswordInput>
  )
}
