import * as React from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

export default function ButtonGroupExample() {
  const [view, setView] = React.useState("Week")
  return (
    <ButtonGroup>
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
      <ButtonGroupSeparator />
      <Button
        variant={view === "Month" ? "secondary" : "outline"}
        aria-pressed={view === "Month"}
        onClick={() => setView("Month")}
      >
        {" "}
        Month{" "}
      </Button>
    </ButtonGroup>
  )
}
