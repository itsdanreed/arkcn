/** Sender-aligned conversation layout with optional avatar, header, and footer. */
import { useContext, type ComponentPropsWithRef } from "react"
import { View, type StyleProp, type TextStyle } from "react-native"
import { MessageLayout, hasMessagePart, messageText } from "../../lib/message-layout"
import { useNativeTheme } from "../../lib/theme"
import { Bubble } from "./bubble"

type ViewProps = ComponentPropsWithRef<typeof View>
export type MessageRootProps = ViewProps & {
  align?: "start" | "end"
  /** Overrides automatic discovery when Footer or a ghost Bubble is inside a custom component. */
  hasFooter?: boolean
  ghost?: boolean
}
function Root({ align = "start", hasFooter, ghost, children, style, ...props }: MessageRootProps) {
  const footer = hasFooter ?? hasMessagePart(children, (child) => child.type === Footer)
  const plain =
    ghost ?? hasMessagePart(children, (child) => child.type === Bubble.Root && child.props.variant === "ghost")
  return (
    <MessageLayout.Provider value={{ align, footer, ghost: plain }}>
      <View
        {...props}
        style={[{ width: "100%", minWidth: 0, flexDirection: align === "end" ? "row-reverse" : "row", gap: 8 }, style]}
      >
        {children}
      </View>
    </MessageLayout.Provider>
  )
}
export type MessageGroupProps = ViewProps
function Group({ style, ...props }: MessageGroupProps) {
  return <View {...props} style={[{ minWidth: 0, gap: 8 }, style]} />
}
export type MessageAvatarProps = ViewProps
function Avatar({ style, ...props }: MessageAvatarProps) {
  const { footer } = useContext(MessageLayout)
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          minWidth: 32,
          flexShrink: 0,
          alignSelf: "flex-end",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 9999,
          backgroundColor: colors.muted,
        },
        footer && { transform: [{ translateY: -32 }] },
        style,
      ]}
    />
  )
}
export type MessageContentProps = ViewProps & { textStyle?: StyleProp<TextStyle> }
function Content({ style, textStyle, children, ...props }: MessageContentProps) {
  const { align } = useContext(MessageLayout)
  const { colors, typography } = useNativeTheme()
  return (
    <View
      {...props}
      style={[{ flex: 1, minWidth: 0, gap: 10, alignItems: align === "end" ? "flex-end" : "flex-start" }, style]}
    >
      {messageText(children, [
        {
          ...typography.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.foreground,
          flexShrink: 1,
          alignSelf: "stretch",
        },
        textStyle,
      ])}
    </View>
  )
}
export type MessageHeaderProps = ViewProps & { textStyle?: StyleProp<TextStyle> }
export type MessageFooterProps = MessageHeaderProps
function Meta({ style, textStyle, children, ...props }: MessageHeaderProps) {
  const { align, ghost } = useContext(MessageLayout)
  const { colors, typography } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          maxWidth: "100%",
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: align === "end" ? "flex-end" : "flex-start",
          paddingHorizontal: ghost ? 0 : 12,
        },
        style,
      ]}
    >
      {messageText(children, [
        { ...typography.medium, fontSize: 12, lineHeight: 16, color: colors.mutedForeground, flexShrink: 1 },
        textStyle,
      ])}
    </View>
  )
}
function Header(props: MessageHeaderProps) {
  return <Meta {...props} />
}
function Footer(props: MessageFooterProps) {
  return <Meta {...props} />
}
export const Message = { Root, Group, Avatar, Content, Header, Footer }
