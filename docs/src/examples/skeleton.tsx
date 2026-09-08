import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonExample() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton.Root className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton.Root className="h-4 w-48" />
        <Skeleton.Root className="h-4 w-32" />
      </div>
    </div>
  )
}
