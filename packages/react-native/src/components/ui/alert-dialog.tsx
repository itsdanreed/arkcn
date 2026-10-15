import { Children, isValidElement, createContext, useContext, type ComponentProps } from "react"
import { View, useWindowDimensions } from "react-native"
import { Dialog, useDialogContext, type DialogRootProps, type DialogContentProps } from "./dialog"
import { useNativeTheme } from "../../lib/theme"
import type { ButtonProps } from "./button"

const Size = createContext<"default" | "sm">("default")
function Root(props: DialogRootProps) {
  return <Dialog.Root role="alertdialog" closeOnInteractOutside={false} {...props} />
}
function Content({ size = "default", ...props }: DialogContentProps & { size?: "default" | "sm" }) {
  const { width } = useWindowDimensions()
  return (
    <Size.Provider value={size}>
      <Dialog.Content showCloseButton={false} maxWidth={size === "sm" || width < 640 ? 320 : 384} {...props} />
    </Size.Provider>
  )
}
function Header({ style, children, ...props }: ComponentProps<typeof View>) {
  const { width } = useWindowDimensions()
  const size = useContext(Size)
  const items = Children.toArray(children)
  const media = items.filter((child) => isValidElement(child) && child.type === Media)
  const text = items.filter((child) => !isValidElement(child) || child.type !== Media)
  const horizontal = width >= 640 && size === "default" && media.length > 0
  return (
    <View
      {...props}
      style={[
        {
          gap: horizontal ? 16 : 6,
          flexDirection: horizontal ? "row" : "column",
          alignItems: width >= 640 && size === "default" ? "stretch" : "center",
        },
        style,
      ]}
    >
      {media}
      <View style={{ gap: 6, flexShrink: 1 }}>{text}</View>
    </View>
  )
}
function Title({ style, ...props }: ComponentProps<typeof Dialog.Title>) {
  const { width } = useWindowDimensions()
  const size = useContext(Size)
  return (
    <Dialog.Title
      {...props}
      style={[{ lineHeight: 24, textAlign: width >= 640 && size === "default" ? "left" : "center" }, style]}
    />
  )
}
function Description({ style, ...props }: ComponentProps<typeof Dialog.Description>) {
  const { width } = useWindowDimensions()
  const size = useContext(Size)
  return (
    <Dialog.Description
      {...props}
      style={[{ textAlign: width >= 640 && size === "default" ? "left" : "center" }, style]}
    />
  )
}
function Footer({ style, children, ...props }: ComponentProps<typeof Dialog.Footer>) {
  const size = useContext(Size)
  return (
    <Dialog.Footer {...props} style={[size === "sm" && { flexDirection: "row" }, style]}>
      {size === "sm" ? Children.map(children, (child) => <View style={{ flex: 1 }}>{child}</View>) : children}
    </Dialog.Footer>
  )
}
function Media({ style, ...props }: ComponentProps<typeof View>) {
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: 40,
          height: 40,
          marginBottom: 8,
          borderRadius: 6,
          backgroundColor: colors.muted,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    />
  )
}
function Cancel(props: ButtonProps) {
  const api = useDialogContext()
  return <Dialog.CloseTrigger ref={api.cancelRef} variant="outline" {...props} />
}
export const AlertDialog = {
  Root,
  Trigger: Dialog.Trigger,
  Context: Dialog.Context,
  Content,
  Backdrop: Dialog.Backdrop,
  Header,
  Title,
  Description,
  Footer,
  Media,
  Cancel,
  CloseTrigger: Dialog.CloseTrigger,
}
