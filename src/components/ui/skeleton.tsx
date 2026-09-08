import { ark } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function SkeletonRoot({ className, ...props }: SkeletonRootProps) {
  return <ark.div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

type SkeletonRootProps = React.ComponentProps<typeof ark.div>

const Skeleton = {
  Root: SkeletonRoot,
}

export { Skeleton, type SkeletonRootProps }
