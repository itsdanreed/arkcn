import { Button } from "@/components/ui/button"
import {
  Tour,
  TourActionTrigger,
  TourActions,
  TourArrow,
  TourBackdrop,
  TourCloseTrigger,
  TourContent,
  TourDescription,
  TourPositioner,
  TourProgressText,
  TourSpotlight,
  TourTitle,
  useTour,
} from "@/components/ui/tour"

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
      <Tour tour={tour}>
        <TourBackdrop />
        <TourSpotlight />
        <TourPositioner>
          <TourContent>
            <TourArrow />
            <TourTitle />
            <TourDescription />
            <TourProgressText />
            <TourActions>
              {(actions) =>
                actions.map((a) => (
                  <TourActionTrigger key={a.label} action={a}>
                    {a.label}
                  </TourActionTrigger>
                ))
              }
            </TourActions>
            <TourCloseTrigger />
          </TourContent>
        </TourPositioner>
      </Tour>
    </>
  )
}
