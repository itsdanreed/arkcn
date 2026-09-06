import { Button } from "@/components/ui/button"
import {
  Steps,
  StepsContent,
  StepsIndicator,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsSeparator,
  StepsTrigger,
} from "@/components/ui/steps"

const items = ["Account", "Profile", "Review"]

export default function StepsExample() {
  return (
    <Steps count={items.length} className="w-full max-w-lg">
      <StepsList>
        {items.map((label, index) => (
          <StepsItem key={label} index={index}>
            <StepsTrigger>
              <StepsIndicator>{index + 1}</StepsIndicator>
              <span>{label}</span>
            </StepsTrigger>
            <StepsSeparator />
          </StepsItem>
        ))}
      </StepsList>
      {items.map((label, index) => (
        <StepsContent key={label} index={index} className="py-4 text-sm text-muted-foreground">
          {label} step content.
        </StepsContent>
      ))}
      <div className="flex gap-2">
        <StepsPrevTrigger asChild>
          <Button variant="outline" size="sm">
            Back
          </Button>
        </StepsPrevTrigger>
        <StepsNextTrigger asChild>
          <Button size="sm">Next</Button>
        </StepsNextTrigger>
      </div>
    </Steps>
  )
}
