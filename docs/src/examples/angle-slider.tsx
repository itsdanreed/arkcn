import {
  AngleSlider,
  AngleSliderControl,
  AngleSliderLabel,
  AngleSliderThumb,
  AngleSliderValueText,
} from "@/components/ui/angle-slider"

export default function AngleSliderExample() {
  return (
    <AngleSlider defaultValue={45}>
      <AngleSliderLabel>Rotation</AngleSliderLabel>
      <AngleSliderControl>
        <AngleSliderThumb />
      </AngleSliderControl>
      <AngleSliderValueText />
    </AngleSlider>
  )
}
