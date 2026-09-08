import { parseColor } from "@ark-ui/react"
import { ColorPicker } from "@/components/ui/color-picker"

const swatches = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"]

export default function ColorPickerExample() {
  return (
    <ColorPicker.Root defaultFormat="hsla" defaultValue={parseColor("#3b82f6").toFormat("hsla")} className="w-72">
      <ColorPicker.Label>Accent</ColorPicker.Label>
      <ColorPicker.Control>
        <ColorPicker.ChannelInput channel="hex" />
        <ColorPicker.Trigger>
          <ColorPicker.ValueSwatch />
        </ColorPicker.Trigger>
      </ColorPicker.Control>
      <ColorPicker.Content>
        <ColorPicker.Area />
        <div className="flex items-center gap-2">
          <ColorPicker.EyeDropperTrigger />
          <div className="flex flex-1 flex-col gap-2">
            <ColorPicker.ChannelSlider channel="hue" />
            <ColorPicker.ChannelSlider channel="alpha" />
          </div>
        </div>
        <ColorPicker.SwatchGroup>
          {swatches.map((c) => (
            <ColorPicker.SwatchTrigger key={c} value={parseColor(c).toFormat("hsla")} aria-label={`Select ${c}`}>
              <ColorPicker.Swatch value={c} />
            </ColorPicker.SwatchTrigger>
          ))}
        </ColorPicker.SwatchGroup>
      </ColorPicker.Content>
    </ColorPicker.Root>
  )
}
