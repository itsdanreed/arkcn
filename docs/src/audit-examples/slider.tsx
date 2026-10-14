import { Slider } from "@/components/ui/slider"
const states = [
  { name: "Single", value: [40] },
  { name: "Range", value: [20, 80] },
  { name: "Disabled", value: [40], disabled: true },
  { name: "Vertical", value: [40], orientation: "vertical" },
] as const
export default function Example() {
  return (
    <div className="space-y-8">
      {states.map((state) => (
        <div key={state.name} data-audit-case={state.name} className={"orientation" in state ? "h-40" : "w-64"}>
          <p className="mb-3 text-sm">{state.name}</p>
          <Slider.Root
            defaultValue={[...state.value]}
            disabled={"disabled" in state && state.disabled}
            orientation={"orientation" in state ? state.orientation : "horizontal"}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              {state.value.map((_, index) => (
                <Slider.Thumb key={index} index={index}>
                  <Slider.HiddenInput />
                </Slider.Thumb>
              ))}
            </Slider.Control>
          </Slider.Root>
        </div>
      ))}
    </div>
  )
}
