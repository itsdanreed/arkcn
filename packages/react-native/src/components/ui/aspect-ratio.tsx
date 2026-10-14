/** A full-width box that preserves its width-to-height ratio as its parent resizes. */
import type { ComponentPropsWithRef } from "react"
import { View } from "react-native"
export type AspectRatioRootProps = ComponentPropsWithRef<typeof View> & {
  /** Width divided by height; defaults to a square. Must be finite and positive. */
  ratio?: number
}
function AspectRatioRoot({ ratio = 1, style, ...props }: AspectRatioRootProps) {
  if (!Number.isFinite(ratio) || ratio <= 0) throw new Error("AspectRatio requires a finite positive ratio")
  return (
    <View style={{ width: "100%", aspectRatio: ratio }}>
      <View {...props} style={[{ position: "absolute", inset: 0 }, style]} />
    </View>
  )
}
export const AspectRatio = { Root: AspectRatioRoot }
