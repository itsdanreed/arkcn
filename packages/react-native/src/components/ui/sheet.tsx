import type { ComponentProps } from "react"
import { View } from "react-native"
import { Dialog, DialogSurface, type DialogContentProps } from "./dialog"
import { useNativeTheme } from "../../lib/theme"

/** Edge panels with the web Sheet's four placements and 200 ms slide/fade motion. */
export type SheetContentProps = DialogContentProps & { side?: "top" | "right" | "bottom" | "left" }
function Content({ side = "right", ...props }: SheetContentProps) {
  return <DialogSurface side={side} {...props} />
}
function Header({ style, ...props }: ComponentProps<typeof View>) {
  return <View {...props} style={[{ gap: 2, padding: 16 }, style]} />
}
function Footer({ style, ...props }: ComponentProps<typeof View>) {
  return <View {...props} style={[{ marginTop: "auto", gap: 8, padding: 16 }, style]} />
}
function Title({ style, ...props }: ComponentProps<typeof Dialog.Title>) {
  const { colors } = useNativeTheme()
  return <Dialog.Title {...props} style={[{ lineHeight: 24, color: colors.foreground }, style]} />
}
export const Sheet = {
  Root: Dialog.Root,
  RootProvider: Dialog.RootProvider,
  Context: Dialog.Context,
  Trigger: Dialog.Trigger,
  CloseTrigger: Dialog.CloseTrigger,
  Backdrop: Dialog.Backdrop,
  Content,
  Header,
  Footer,
  Title,
  Description: Dialog.Description,
}
export { useDialog, useDialogContext } from "./dialog"
