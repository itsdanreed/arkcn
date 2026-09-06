import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IconFacebook, IconGithub } from "@/demo/apps/brand-icons"
import { useForm } from "@/lib/form"
import { AuthLayout, AuthSeparator, isEmail } from "./auth-layout"
import { PasswordField } from "./password-field"

type Values = { email: string; password: string; confirm: string }

function validate(v: Values) {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (!v.email) errors.email = "Please enter your email."
  else if (!isEmail(v.email)) errors.email = "That doesn't look like an email address."
  if (!v.password) errors.password = "Please enter a password."
  else if (v.password.length < 7) errors.password = "Password must be at least 7 characters."
  if (v.confirm !== v.password) errors.confirm = "Passwords don't match."
  return errors
}

export function SignUpPage({ navigate }: { navigate: (to: string) => void }) {
  const { values, errors, setValue, handleSubmit } = useForm<Values>(
    { email: "", password: "", confirm: "" },
    validate,
    (data) => {
      toast.success(`Account created for ${data.email}`)
      navigate("/")
    }
  )
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email and a password to get started. Your workspace is ready in seconds."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="#/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
            <Input
              id="sign-up-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={values.email}
              aria-invalid={!!errors.email || undefined}
              onChange={(e) => setValue("email", e.currentTarget.value)}
            />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <PasswordField
            id="sign-up-password"
            label="Password"
            autoComplete="new-password"
            value={values.password}
            onChange={(v) => setValue("password", v)}
            error={errors.password}
          />
          <PasswordField
            id="sign-up-confirm"
            label="Confirm password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(v) => setValue("confirm", v)}
            error={errors.confirm}
          />
          <Button type="submit" className="w-full">
            Create account
          </Button>
          <AuthSeparator />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => toast("GitHub sign-up is a demo")}>
              <IconGithub /> GitHub
            </Button>
            <Button type="button" variant="outline" onClick={() => toast("Facebook sign-up is a demo")}>
              <IconFacebook /> Facebook
            </Button>
          </div>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
