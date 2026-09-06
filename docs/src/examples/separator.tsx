import { Separator } from "@/components/ui/separator"

export default function SeparatorExample() {
  return (
    <div className="w-72 text-sm">
      <p className="font-medium">arkcn</p>
      <p className="text-muted-foreground">Components on Ark UI.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  )
}
