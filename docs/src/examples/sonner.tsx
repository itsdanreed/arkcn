import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// The docs mount <Toaster /> once at the root; do the same in your app.
export default function SonnerExample() {
  return (
    <Button variant="outline" onClick={() => toast.success("Event created", { description: "Sunday, 9:00 AM" })}>
      Show toast
    </Button>
  )
}
