import { PasswordInput } from "@/components/ui/password-input"

export default function PasswordInputExample() {
  return (
    <PasswordInput.Root className="w-72">
      <PasswordInput.Label>Password</PasswordInput.Label>
      <PasswordInput.Control>
        <PasswordInput.Input placeholder="••••••••" />
        <PasswordInput.VisibilityTrigger />
      </PasswordInput.Control>
    </PasswordInput.Root>
  )
}
