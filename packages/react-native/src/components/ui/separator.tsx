import type { ComponentPropsWithRef } from "react"
import { View } from "react-native"
import { useNativeTheme } from "../../lib/theme"

export type SeparatorRootProps = ComponentPropsWithRef<typeof View> & { orientation?: "horizontal" | "vertical" }
function SeparatorRoot({ orientation = "horizontal", style, ...props }: SeparatorRootProps) {
  const { colors } = useNativeTheme()
  return (
    <View
      accessible={false}
      {...props}
      style={[
        { backgroundColor: colors.border },
        orientation === "horizontal" ? { height: 1, alignSelf: "stretch" } : { width: 1, alignSelf: "stretch" },
        style,
      ]}
    />
  )
}
/** Decorative hairline divider; use a parent with height for vertical separators. */
export const Separator = { Root: SeparatorRoot }
