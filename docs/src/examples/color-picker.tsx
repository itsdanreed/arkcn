import { parseColor } from "@ark-ui/react"
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerChannelInput,
  ColorPickerChannelSlider,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropperTrigger,
  ColorPickerLabel,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerTrigger,
  ColorPickerValueSwatch,
} from "@/components/ui/color-picker"

const swatches = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"]

export default function ColorPickerExample() {
  return (
    <ColorPicker defaultValue={parseColor("#3b82f6")} className="w-72">
      <ColorPickerLabel>Accent</ColorPickerLabel>
      <ColorPickerControl>
        <ColorPickerChannelInput channel="hex" />
        <ColorPickerTrigger>
          <ColorPickerValueSwatch />
        </ColorPickerTrigger>
      </ColorPickerControl>
      <ColorPickerContent>
        <ColorPickerArea />
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropperTrigger />
          <div className="flex flex-1 flex-col gap-2">
            <ColorPickerChannelSlider channel="hue" />
            <ColorPickerChannelSlider channel="alpha" />
          </div>
        </div>
        <ColorPickerSwatchGroup>
          {swatches.map((c) => (
            <ColorPickerSwatch key={c} value={c} />
          ))}
        </ColorPickerSwatchGroup>
      </ColorPickerContent>
    </ColorPicker>
  )
}
