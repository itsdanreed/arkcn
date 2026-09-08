import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function AspectRatioExample() {
  return (
    <div className="w-96">
      <AspectRatio.Root ratio={16 / 9} className="rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">16 : 9</div>
      </AspectRatio.Root>
    </div>
  )
}
