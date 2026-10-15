import { useState } from "react"
import { Text, View } from "react-native"
import { Slider } from "./components/ui/slider"
import { Button } from "./components/ui/button"
import { useNativeTheme } from "./lib/theme"
export function SliderValidation() {
  const { colors, typography } = useNativeTheme()
  const [value, setValue] = useState([20, 80])
  const [committed, setCommitted] = useState("none")
  const [disabled, setDisabled] = useState(false)
  const label = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }
  return (
    <View style={{ gap: 28 }}>
      <Slider.Root
        value={value}
        onValueChange={({ value }) => setValue(value)}
        onValueChangeEnd={({ value }) => setCommitted(value.join(" – "))}
        minStepsBetweenThumbs={10}
        disabled={disabled}
        style={{ maxWidth: 400 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Slider.Label>Price range</Slider.Label>
          <Slider.ValueText />
        </View>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          {[0, 1].map((index) => (
            <Slider.Thumb key={index} index={index} accessibilityLabel={index ? "Maximum price" : "Minimum price"}>
              <Slider.DraggingIndicator />
            </Slider.Thumb>
          ))}
        </Slider.Control>
        <Slider.MarkerGroup>
          {[0, 50, 100].map((value) => (
            <Slider.Marker key={value} value={value}>
              {value}
            </Slider.Marker>
          ))}
        </Slider.MarkerGroup>
      </Slider.Root>
      <Text style={label}>Last committed: {committed}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button variant="outline" onPress={() => setValue([20, 80])}>
          Reset range
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "Enable slider" : "Disable slider"}
        </Button>
      </View>
      <Slider.Root min={-1} max={1} step={0.1} defaultValue={[0]} origin="center" style={{ maxWidth: 400 }}>
        <Slider.Label>Balance · decimal steps</Slider.Label>
        <Slider.ValueText />
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0}>
            <Slider.DraggingIndicator />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
      <Slider.Root defaultValue={[30]} dir="rtl" style={{ maxWidth: 400 }}>
        <Slider.Label>Right to left</Slider.Label>
        <Slider.ValueText />
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} />
        </Slider.Control>
      </Slider.Root>
      <View style={{ flexDirection: "row", gap: 64, alignItems: "flex-start" }}>
        <Slider.Root orientation="vertical" defaultValue={[25, 75]} style={{ height: 220, alignItems: "center" }}>
          <Slider.Label>Vertical</Slider.Label>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} accessibilityLabel="Lower vertical value" />
            <Slider.Thumb index={1} accessibilityLabel="Upper vertical value" />
          </Slider.Control>
          <Slider.ValueText />
        </Slider.Root>
        <Slider.Root readOnly defaultValue={[65]} style={{ width: 240 }}>
          <Slider.Label>Read only</Slider.Label>
          <Slider.ValueText />
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>
      </View>
    </View>
  )
}
