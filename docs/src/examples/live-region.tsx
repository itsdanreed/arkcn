import { Button } from "@/components/ui/button"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

export default function LiveRegionExample() {
  const { message, announce } = useLiveRegion({ clearAfter: 3000 })
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => announce(`Saved at ${new Date().toLocaleTimeString()}`)}>
        Announce
      </Button>
      <p className="text-sm text-muted-foreground">Screen readers hear: {message || "…"}</p>
      <LiveRegion message={message} />
    </div>
  )
}
