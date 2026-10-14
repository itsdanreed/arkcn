import { Button } from "@/components/ui/button"
import { Tour, useTour } from "@/components/ui/tour"
import { useAuditMotion } from "../audit-motion"

export default function Example() {
  const { trace } = useAuditMotion('[data-slot="tour-content"]')
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
        id: "target",
        type: "tooltip",
        title: "The trigger",
        description: "Steps can spotlight any element.",
        target: () => document.getElementById("audit-tour-target"),
        placement: "bottom-start",
        actions: [
          { label: "Back", action: "prev" },
          { label: "Done", action: "dismiss" },
        ],
      },
    ],
  })
  return (
    <div className="flex gap-2">
      <Button id="audit-tour-target" variant="outline" onClick={() => tour.start()}>
        Start tour
      </Button>
      <Button variant="outline" onClick={() => tour.start("target")}>
        Start anchored step
      </Button>
      <Tour.Root tour={tour}>
        <Tour.Portal>
          <Tour.Backdrop />
          <Tour.Spotlight />
          <Tour.Positioner>
            <Tour.Content>
              <Tour.Title />
              <Tour.Description />
              <Tour.ProgressText />
              <Tour.Control>
                <Tour.Actions>
                  {(actions) =>
                    actions.map((action) => (
                      <Tour.ActionTrigger key={action.label} action={action}>
                        {action.label}
                      </Tour.ActionTrigger>
                    ))
                  }
                </Tour.Actions>
              </Tour.Control>
              <Tour.CloseTrigger />
            </Tour.Content>
          </Tour.Positioner>
        </Tour.Portal>
      </Tour.Root>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
