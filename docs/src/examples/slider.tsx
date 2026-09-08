import { Slider } from "@/components/ui/slider"

// Slider renders the track, range, and thumbs itself; children go above them.
export default function SliderExample() {
  return (
    <Slider.Root defaultValue={[40]} className="w-72">
      <div className="flex justify-between text-sm">
        <Slider.Label>Volume</Slider.Label>
        <Slider.ValueText />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0}>
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
  )
}
