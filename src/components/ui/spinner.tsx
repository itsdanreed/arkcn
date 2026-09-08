import { ark } from "@ark-ui/react"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

function SpinnerRoot({ className, ...props }: SpinnerRootProps) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

type SpinnerRootProps = React.ComponentProps<typeof ark.svg>

const Spinner = {
  Root: SpinnerRoot,
}

export { Spinner, type SpinnerRootProps }
