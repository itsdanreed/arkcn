import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IconFacebook, IconGithub } from "@/demo/apps/brand-icons"
import { useForm } from "@/lib/form"
import { AuthLayout, AuthSeparator, isEmail } from "./auth-layout"
import { PasswordField } from "./password-field"

type Values = { email: string; password: string }

function validate(v: Values) {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (!v.email) errors.email = "Please enter your email."
  else if (!isEmail(v.email)) errors.email = "That doesn't look like an email address."
  if (!v.password) errors.password = "Please enter your password."
  else if (v.password.length < 7) errors.password = "Password must be at least 7 characters."
  return errors
}

export function SignInPage({ navigate }: { navigate: (to: string) => void }) {
  const { values, errors, setValue, handleSubmit } = useForm<Values>({ email: "", password: "" }, validate, (data) => {
    toast.success(`Welcome back, ${data.email}`)
    navigate("/")
  })
  return (
    <AuthLayout
      title="Sign in"
      description="Enter your email and password below to sign in to your workspace."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="#/sign-up" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
            <Input
              id="sign-in-email"
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
            id="sign-in-password"
            label="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={(v) => setValue("password", v)}
            error={errors.password}
            action={
              <a href="#/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Forgot password?
              </a>
            }
          />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
          <AuthSeparator />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => toast("GitHub sign-in is a demo")}>
              <IconGithub /> GitHub
            </Button>
            <Button type="button" variant="outline" onClick={() => toast("Facebook sign-in is a demo")}>
              <IconFacebook /> Facebook
            </Button>
          </div>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
