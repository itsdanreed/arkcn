import { Slider, SliderLabel, SliderValueText } from "@/components/ui/slider"

// Slider renders the track, range, and thumbs itself; children go above them.
export default function SliderExample() {
  return (
    <Slider defaultValue={[40]} className="w-72">
      <div className="flex justify-between text-sm">
        <SliderLabel>Volume</SliderLabel>
        <SliderValueText />
      </div>
    </Slider>
  )
}
