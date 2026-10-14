import { useState } from "react"
import { XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "../ui/popover"
import { useAuditMotion } from "../../src/audit-motion"

export default function Example() {
  const [step, setStep] = useState<string | null>(null)
  const { trace } = useAuditMotion('[data-slot="dialog-content"], [data-slot="popover-content"]')
  return (
    <div className="flex gap-2">
      <Popover open={step === "target"} onOpenChange={(open) => !open && step === "target" && setStep(null)}>
        <PopoverTrigger render={<Button variant="outline" onClick={() => setStep("welcome")} />}>
          Start tour
        </PopoverTrigger>
        <PopoverContent align="start">
          <PopoverTitle>The trigger</PopoverTitle>
          <PopoverDescription>Steps can spotlight any element.</PopoverDescription>
          <p className="text-xs text-muted-foreground tabular-nums">2 of 2</p>
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep("welcome")}>
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStep(null)}>
              Done
            </Button>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setStep(null)}>
            <XIcon />
          </Button>
        </PopoverContent>
      </Popover>
      <Button variant="outline" onClick={() => setStep("target")}>
        Start anchored step
      </Button>
      <Dialog open={step === "welcome"} onOpenChange={(open) => !open && step === "welcome" && setStep(null)}>
        <DialogContent>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>A two-step tour of this preview.</DialogDescription>
          <p className="text-xs text-muted-foreground tabular-nums">1 of 2</p>
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep("target")}>
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
