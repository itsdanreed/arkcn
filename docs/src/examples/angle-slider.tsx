import { AngleSlider } from "@/components/ui/angle-slider"

export default function AngleSliderExample() {
  return (
    <AngleSlider.Root defaultValue={45}>
      <AngleSlider.Label>Rotation</AngleSlider.Label>
      <AngleSlider.Control>
        <AngleSlider.Thumb />
      </AngleSlider.Control>
      <AngleSlider.ValueText />
    </AngleSlider.Root>
  )
}
