import { Button } from "@/components/ui/button"
import { Steps } from "@/components/ui/steps"

const items = ["Account", "Profile", "Review"]

export default function StepsExample() {
  return (
    <Steps.Root count={items.length} className="w-full max-w-lg">
      <Steps.List>
        {items.map((label, index) => (
          <Steps.Item key={label} index={index}>
            <Steps.Trigger>
              <Steps.Indicator>{index + 1}</Steps.Indicator>
              <span>{label}</span>
            </Steps.Trigger>
            <Steps.Separator />
          </Steps.Item>
        ))}
      </Steps.List>
      {items.map((label, index) => (
        <Steps.Content key={label} index={index} className="py-4 text-sm text-muted-foreground">
          {label} step content.
        </Steps.Content>
      ))}
      <Steps.CompletedContent>All steps complete.</Steps.CompletedContent>
      <div className="flex gap-2">
        <Steps.PrevTrigger asChild>
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Steps.PrevTrigger>
        <Steps.NextTrigger asChild>
          <Button size="sm">Next</Button>
        </Steps.NextTrigger>
      </div>
    </Steps.Root>
  )
}
