import { parseColor } from "@ark-ui/react"
import { ColorPicker } from "@/components/ui/color-picker"
import ColorPickerInteraction from "../examples/color-picker"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="color-picker-content"]')
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "readonly"].map((state) => (
        <section key={state} data-audit-case={state} className="w-72 max-w-full">
          <ColorPicker.Root
            defaultValue={parseColor("#3b82f6")}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <ColorPicker.Label>{state}</ColorPicker.Label>
            <ColorPicker.Control>
              <ColorPicker.ChannelInput channel="hex" aria-label={state} />
              <ColorPicker.Trigger aria-label={`Open ${state}`} />
            </ColorPicker.Control>
            <ColorPicker.Content>
              <div className="h-16">Color options</div>
              <ColorPicker.FormatTrigger>Format</ColorPicker.FormatTrigger>
            </ColorPicker.Content>
          </ColorPicker.Root>
        </section>
      ))}
      <ColorPickerInteraction />
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
