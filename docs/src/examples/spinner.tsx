import { Spinner } from "@/components/ui/spinner"

export default function SpinnerExample() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner.Root /> Loading…
    </div>
  )
}
