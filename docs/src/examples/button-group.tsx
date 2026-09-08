import * as React from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export default function ButtonGroupExample() {
  const [view, setView] = React.useState("Week")
  return (
    <ButtonGroup.Root>
      <Button
        variant={view === "Day" ? "secondary" : "outline"}
        aria-pressed={view === "Day"}
        onClick={() => setView("Day")}
      >
        {" "}
        Day{" "}
      </Button>
      <Button
        variant={view === "Week" ? "secondary" : "outline"}
        aria-pressed={view === "Week"}
        onClick={() => setView("Week")}
      >
        {" "}
        Week{" "}
      </Button>
      <ButtonGroup.Separator />
      <Button
        variant={view === "Month" ? "secondary" : "outline"}
        aria-pressed={view === "Month"}
        onClick={() => setView("Month")}
      >
        {" "}
        Month{" "}
      </Button>
    </ButtonGroup.Root>
  )
}
