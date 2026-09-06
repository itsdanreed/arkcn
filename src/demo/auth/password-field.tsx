import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputInput,
  PasswordInputVisibilityTrigger,
} from "@/components/ui/password-input"

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  action,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete: "current-password" | "new-password"
  /** Rendered at the right of the label, e.g. a "Forgot password?" link. */
  action?: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {action}
      </div>
      <PasswordInput ids={{ input: id }} invalid={!!error}>
        <PasswordInputControl>
          <PasswordInputInput
            placeholder="••••••••"
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          <PasswordInputVisibilityTrigger />
        </PasswordInputControl>
      </PasswordInput>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
