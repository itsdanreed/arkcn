import {
  Slider,
  SliderControl,
  SliderLabel,
  SliderRange,
  SliderThumb,
  SliderTrack,
  SliderValueText,
} from "@/components/ui/slider"

export default function SliderExample() {
  return (
    <Slider defaultValue={[40]} className="w-72">
      <div className="mb-2 flex justify-between text-sm">
        <SliderLabel>Volume</SliderLabel>
        <SliderValueText />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb index={0} />
      </SliderControl>
    </Slider>
  )
}
