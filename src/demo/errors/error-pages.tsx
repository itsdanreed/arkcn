import { ConstructionIcon, ServerCrashIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ErrorPage } from "./error-page"

type Props = { navigate: (to: string) => void }

export function UnauthorizedPage({ navigate }: Props) {
  return (
    <ErrorPage
      code="401"
      title="Sign in to continue"
      description="Your session has expired or you are not signed in. Sign in to pick up where you left off."
      navigate={navigate}
      actions={
        <Button type="button" variant="secondary" onClick={() => navigate("/sign-in")}>
          Sign in
        </Button>
      }
    />
  )
}

export function ForbiddenPage({ navigate }: Props) {
  return (
    <ErrorPage
      code="403"
      title="You don't have access"
      description="This page is limited to certain roles. Ask a workspace admin to grant you access, or go back."
      navigate={navigate}
      actions={
        <Button type="button" variant="secondary" onClick={() => toast("Access request sent to your admin")}>
          Request access
        </Button>
      }
    />
  )
}

export function NotFoundPage({ navigate, path }: Props & { path?: string }) {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      description={
        path ? (
          <>
            Nothing lives at <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-sm">{path}</code>. It may
            have moved, or the link is wrong.
          </>
        ) : (
          "The page you are looking for does not exist or has moved."
        )
      }
      navigate={navigate}
    />
  )
}

export function InternalServerErrorPage({ navigate }: Props) {
  return (
    <ErrorPage
      code="500"
      title="Something went wrong"
      description="We hit an unexpected error while loading this page. It has been reported; please try again in a moment."
      navigate={navigate}
      actions={
        <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      }
    />
  )
}

export function MaintenancePage({ navigate }: Props) {
  return (
    <ErrorPage
      icon={<ConstructionIcon className="size-12 text-muted-foreground" />}
      code="503"
      title="Down for maintenance"
      description="We are upgrading the workspace and will be back shortly. Nothing you have saved is affected."
      navigate={navigate}
      actions={
        <Button type="button" variant="secondary" onClick={() => toast("Status page: all systems upgrading")}>
          <ServerCrashIcon /> View status
        </Button>
      }
    />
  )
}
