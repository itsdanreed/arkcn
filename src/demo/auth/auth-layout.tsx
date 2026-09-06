import { CommandIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Centered card layout for the auth pages (outside the app shell). */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#/" className="flex items-center justify-center gap-2 font-medium" aria-label="UI Toolkit home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CommandIcon className="size-4" />
          </span>
          UI Toolkit
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer}
        <p className="px-6 text-center text-xs text-balance text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#/help-center" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#/help-center" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export function AuthSeparator({ children = "Or continue with" }: { children?: React.ReactNode }) {
  return (
    <div className="relative my-2 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
      <span className="relative z-10 bg-card px-2 text-muted-foreground">{children}</span>
    </div>
  )
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isEmail = (value: string) => emailPattern.test(value)
