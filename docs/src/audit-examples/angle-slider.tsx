import { AngleSlider } from "@/components/ui/angle-slider"
export default function Example() {
  return (
    <div className="flex flex-wrap gap-8">
      {["default", "disabled", "readonly"].map((state) => (
        <section key={state} data-audit-case={state} className="flex">
          <AngleSlider.Root defaultValue={45} disabled={state === "disabled"} readOnly={state === "readonly"}>
            <AngleSlider.Label>{state}</AngleSlider.Label>
            <AngleSlider.Control>
              <AngleSlider.MarkerGroup>
                {[0, 90, 180, 270].map((value) => (
                  <AngleSlider.Marker key={value} value={value} />
                ))}
              </AngleSlider.MarkerGroup>
              <AngleSlider.Thumb />
            </AngleSlider.Control>
            <AngleSlider.ValueText />
            <AngleSlider.HiddenInput />
          </AngleSlider.Root>
        </section>
      ))}
    </div>
  )
}
