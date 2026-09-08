import { Button } from "@/components/ui/button"
import { Tour, useTour } from "@/components/ui/tour"

export default function TourExample() {
  const tour = useTour({
    steps: [
      {
        id: "welcome",
        type: "dialog",
        title: "Welcome",
        description: "A two-step tour of this preview.",
        actions: [{ label: "Next", action: "next" }],
      },
      {
        id: "button",
        type: "tooltip",
        title: "The trigger",
        description: "Steps can spotlight any element.",
        target: () => document.getElementById("tour-target"),
        actions: [
          { label: "Back", action: "prev" },
          { label: "Done", action: "dismiss" },
        ],
      },
    ],
  })
  return (
    <>
      <Button id="tour-target" variant="outline" onClick={() => tour.start()}>
        Start tour
      </Button>
      <Tour.Root tour={tour}>
        <Tour.Backdrop />
        <Tour.Spotlight />
        <Tour.Positioner>
          <Tour.Content>
            <Tour.Arrow />
            <Tour.Title />
            <Tour.Description />
            <Tour.ProgressText />
            <Tour.Actions>
              {(actions) =>
                actions.map((a) => (
                  <Tour.ActionTrigger key={a.label} action={a}>
                    {a.label}
                  </Tour.ActionTrigger>
                ))
              }
            </Tour.Actions>
            <Tour.CloseTrigger />
          </Tour.Content>
        </Tour.Positioner>
      </Tour.Root>
    </>
  )
}
