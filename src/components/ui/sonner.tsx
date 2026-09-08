import { useTheme } from "next-themes"
import { Toaster as SonnerPrimitive, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const SonnerRoot = ({ ...props }: SonnerRootProps) => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerPrimitive
      theme={theme as ToasterProps["theme"]}
      className="group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

type SonnerRootProps = ToasterProps

const Sonner = {
  Root: SonnerRoot,
}

export { Sonner, type SonnerRootProps }
