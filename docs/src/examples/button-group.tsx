import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

export default function ButtonGroupExample() {
  return (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  )
}
