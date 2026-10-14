/** Text labels with the web typography and explicit native control activation. */
import type { ComponentPropsWithRef, RefObject } from "react"
import { Text } from "react-native"
import { useNativeTheme } from "../../lib/theme"
export type LabelRootProps = ComponentPropsWithRef<typeof Text> & {
  /** Prevents activation and dims the label. */
  disabled?: boolean
  /** Input to focus when the label is pressed. Use onPress for selection controls. */
  controlRef?: RefObject<{ focus: () => void } | null>
}
function LabelRoot({ disabled = false, controlRef, onPress, style, ...props }: LabelRootProps) {
  const { colors, typography, fontSize, opacity } = useNativeTheme()
  return (
    <Text
      selectable={false}
      {...props}
      disabled={disabled}
      onPress={
        controlRef || onPress
          ? (event) => {
              if (disabled) return
              onPress?.(event)
              if (!event.defaultPrevented) controlRef?.current?.focus()
            }
          : undefined
      }
      style={[
        {
          ...typography.medium,
          fontSize: fontSize.md,
          lineHeight: fontSize.md,
          color: colors.foreground,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    />
  )
}
export const Label = { Root: LabelRoot }
