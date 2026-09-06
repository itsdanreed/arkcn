import { Button } from "@/components/ui/button"

/** Full-page error state shared by the error routes (rendered outside the app shell). */
export function ErrorPage({
  code,
  title,
  description,
  icon,
  actions,
  navigate,
}: {
  code?: string
  title: string
  description: React.ReactNode
  icon?: React.ReactNode
  /** Extra actions rendered before the defaults. */
  actions?: React.ReactNode
  navigate: (to: string) => void
}) {
  return (
    <div data-slot="error-page" className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        {icon}
        {code && (
          <span className="text-7xl leading-none font-bold tracking-tight text-muted-foreground/60 tabular-nums">
            {code}
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {actions}
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Button type="button" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
