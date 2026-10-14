import { Steps } from "@/components/ui/steps"
const items = ["Account", "Profile", "Review"]
export default function Example() {
  return (
    <div className="space-y-8">
      {["horizontal", "vertical"].map((orientation) => (
        <section key={orientation} data-audit-case={orientation}>
          <Steps.Root count={3} orientation={orientation as "horizontal" | "vertical"}>
            <Steps.List>
              {items.map((label, index) => (
                <Steps.Item key={label} index={index}>
                  <Steps.Trigger>
                    <Steps.Indicator />
                    {label}
                  </Steps.Trigger>
                  <Steps.Separator />
                </Steps.Item>
              ))}
            </Steps.List>
            <div className="flex flex-1 flex-col gap-4">
              <Steps.Progress aria-label={`${orientation} progress`} />
              {items.map((label, index) => (
                <Steps.Content key={label} index={index}>
                  {label} content
                </Steps.Content>
              ))}
              <Steps.CompletedContent>All steps complete.</Steps.CompletedContent>
              <div className="flex gap-2">
                <Steps.PrevTrigger>Back</Steps.PrevTrigger>
                <Steps.NextTrigger>Next</Steps.NextTrigger>
              </div>
            </div>
          </Steps.Root>
        </section>
      ))}
    </div>
  )
}
