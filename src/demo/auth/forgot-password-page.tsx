import * as React from "react"
import { MailCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@/lib/form"
import { AuthLayout, isEmail } from "./auth-layout"

type Values = { email: string }

function validate(v: Values) {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (!v.email) errors.email = "Please enter your email."
  else if (!isEmail(v.email)) errors.email = "That doesn't look like an email address."
  return errors
}

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const { values, errors, setValue, handleSubmit } = useForm<Values>({ email: "" }, validate, (data) =>
    setSentTo(data.email)
  )
  return (
    <AuthLayout
      title={sentTo ? "Check your inbox" : "Forgot password"}
      description={
        sentTo
          ? `If an account exists for ${sentTo}, a reset link is on its way.`
          : "Enter your email and we'll send you a link to reset your password."
      }
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <a href="#/sign-in" className="underline underline-offset-4 hover:text-primary">
            Back to sign in
          </a>
        </p>
      }
    >
      {sentTo ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <MailCheckIcon className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">The link expires in 15 minutes.</p>
          <Button type="button" variant="outline" className="w-full" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={values.email}
                aria-invalid={!!errors.email || undefined}
                onChange={(e) => setValue("email", e.currentTarget.value)}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthLayout>
  )
}
