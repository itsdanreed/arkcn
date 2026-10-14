import { useState } from "react"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Separator } from "../ui/separator"
function Flow({ orientation }: { orientation: string }) {
  const [step, setStep] = useState(0)
  return (
    <section data-audit-case={orientation} className="flex flex-col gap-4">
      <Progress value={(step / 3) * 100} aria-label={`${orientation} progress`} />
      <Separator />
      <div className="text-sm">
        {["Account content", "Profile content", "Review content", "All steps complete."][step]}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button size="sm" disabled={step === 3} onClick={() => setStep(step + 1)}>
          Next
        </Button>
      </div>
    </section>
  )
}
export default function Example() {
  return (
    <div className="space-y-8">
      {["horizontal", "vertical"].map((o) => (
        <Flow key={o} orientation={o} />
      ))}
    </div>
  )
}
