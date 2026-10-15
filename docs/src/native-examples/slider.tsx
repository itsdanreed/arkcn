import { View } from "react-native"
import { Slider } from "@multicomma/arkcn-react-native/ui/slider"
export default function SliderExample() {
  return (
    <Slider.Root defaultValue={[40]} style={{ width: 288, maxWidth: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Slider.Label>Volume</Slider.Label>
        <Slider.ValueText />
      </View>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0} />
      </Slider.Control>
    </Slider.Root>
  )
}
