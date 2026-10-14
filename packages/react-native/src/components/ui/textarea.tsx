import { Input, type InputRootProps } from "./input"
import { useNativeTheme } from "../../lib/theme"

export type TextareaRootProps = InputRootProps
function TextareaRoot({ style, ...props }: TextareaRootProps) {
  const { textareaHeight, spacing } = useNativeTheme()
  return (
    <Input.Root
      {...props}
      multiline
      style={[{ minHeight: textareaHeight, textAlignVertical: "top", paddingVertical: spacing.sm }, style]}
    />
  )
}
/** Multiline native input with the same validation and focus treatment as Input. */
export const Textarea = { Root: TextareaRoot }
