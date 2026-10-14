import { Slider } from "../ui/slider"
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
          <Slider
            defaultValue={[...state.value]}
            disabled={"disabled" in state && state.disabled}
            orientation={"orientation" in state ? state.orientation : "horizontal"}
          />
        </div>
      ))}
    </div>
  )
}
