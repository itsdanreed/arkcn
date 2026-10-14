import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react"
import { Image, Text, View, type LayoutRectangle, type LayoutChangeEvent } from "react-native"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"

/** Circular identity images with loading/error fallbacks and shared small/default/large sizes. */
export type AvatarRootProps = ComponentPropsWithRef<typeof View> & { size?: "sm" | "default" | "lg" }
const [Provider, useAvatar] = createRequiredContext<{
  size: "sm" | "default" | "lg"
  loaded: boolean
  setLoaded: (loaded: boolean) => void
}>("Avatar")
const GroupContext = createContext<{ size: "sm" | "default" | "lg" } | null>(null)
function AvatarRoot({ size = "default", style, children, ...props }: AvatarRootProps) {
  const [loaded, setLoaded] = useState(false)
  const group = useContext(GroupContext)
  const { colors, colorScheme, avatar, radius } = useNativeTheme()
  return (
    <Provider value={{ size, loaded, setLoaded }}>
      <View
        {...props}
        style={[
          {
            width: avatar[size],
            height: avatar[size],
            flexShrink: 0,
            borderRadius: radius.full,
            backgroundColor: colors.muted,
            ...(group ? { boxShadow: [{ offsetX: 0, offsetY: 0, spreadDistance: 2, color: colors.background }] } : {}),
          },
          style,
        ]}
      >
        {children}
        <View
          pointerEvents="none"
          accessible={false}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.border,
            mixBlendMode: colorScheme === "dark" ? "lighten" : "darken",
          }}
        />
      </View>
    </Provider>
  )
}
AvatarRoot.displayName = "AvatarRoot"
export type AvatarImageProps = ComponentPropsWithRef<typeof Image>
function AvatarImage({ source, src, srcSet, style, onLoad, onError, ...props }: AvatarImageProps) {
  const { setLoaded } = useAvatar()
  const { radius } = useNativeTheme()
  const signature = JSON.stringify({ source, src, srcSet })
  const generation = useMemo(() => ({ signature }), [signature])
  const request = useRef<typeof generation | null>(null)
  useLayoutEffect(() => {
    request.current = generation
    setLoaded(false)
    return () => {
      request.current = null
      setLoaded(false)
    }
  }, [generation, setLoaded])
  return (
    <Image
      key={signature}
      accessible={false}
      resizeMode="cover"
      {...props}
      source={source}
      src={src}
      srcSet={srcSet}
      onLoad={(event) => {
        if (request.current === generation) setLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        if (request.current === generation) setLoaded(false)
        onError?.(event)
      }}
      style={[{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: radius.full }, style]}
    />
  )
}
export type AvatarFallbackProps = ComponentPropsWithRef<typeof Text>
function AvatarFallback({ style, ...props }: AvatarFallbackProps) {
  const { loaded, size } = useAvatar()
  const { colors, avatar, fontSize, typography, radius } = useNativeTheme()
  if (loaded) return null
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius.full,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        {...props}
        style={[
          {
            ...typography.regular,
            color: colors.mutedForeground,
            fontSize: size === "sm" ? fontSize.sm : fontSize.md,
            lineHeight: avatar[size],
            textAlign: "center",
          },
          style,
        ]}
      />
    </View>
  )
}
export type AvatarBadgeProps = ComponentPropsWithRef<typeof View>
function AvatarBadge(props: AvatarBadgeProps) {
  return <AvatarBadgeVisual {...props} size={useAvatar().size} />
}
AvatarBadge.displayName = "AvatarBadge"
function isAvatarPart(type: unknown, name: string) {
  return typeof type === "function" && "displayName" in type && type.displayName === name
}
function AvatarBadgeVisual({ children, style, size, ...props }: AvatarBadgeProps & { size: "sm" | "default" | "lg" }) {
  const { colors, radius } = useNativeTheme()
  const dimension = size === "sm" ? 8 : size === "lg" ? 12 : 10
  return (
    <View
      {...props}
      style={[
        {
          position: "absolute",
          right: 0,
          bottom: 0,
          zIndex: 10,
          width: dimension,
          height: dimension,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.full,
          backgroundColor: colors.primary,
          boxShadow: [{ offsetX: 0, offsetY: 0, spreadDistance: 2, color: colors.background }],
        },
        style,
      ]}
    >
      {Children.map(children, (child) =>
        isValidElement<{ size?: number; color?: string }>(child)
          ? size === "sm"
            ? null
            : cloneElement(child, { size: 8, color: child.props.color ?? colors.primaryForeground })
          : child
      )}
    </View>
  )
}
export type AvatarGroupProps = ComponentPropsWithRef<typeof View>
function AvatarGroup({ children, style, ...props }: AvatarGroupProps) {
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({})
  const { avatar } = useNativeTheme()
  const items = Children.toArray(children)
  const sizes = items.map((child) => (isValidElement<AvatarRootProps>(child) ? child.props.size : undefined))
  const size = sizes.includes("sm") ? "sm" : sizes.includes("lg") ? "lg" : "default"
  const badges: ReactNode[] = []
  let offset = 0
  const avatars = items.map((child, index) => {
    if (!isValidElement<AvatarRootProps>(child)) return child
    const key = String(child.key ?? index)
    const avatarSize = isAvatarPart(child.type, "AvatarRoot") ? (child.props.size ?? "default") : size
    const dimension = avatar[avatarSize]
    if (index > 0) offset -= 8
    const rect = layouts[key] ?? { x: offset, y: 0, width: dimension, height: dimension }
    offset += rect.width
    const parts = Children.toArray(child.props.children)
    const lifted = isAvatarPart(child.type, "AvatarRoot")
      ? parts.filter((part) => isValidElement(part) && isAvatarPart(part.type, "AvatarBadge"))
      : []
    for (const [badgeIndex, badge] of lifted.entries()) {
      if (!isValidElement<AvatarBadgeProps>(badge)) continue
      // Native z-index is scoped to siblings. Lift the badge above later group members.
      badges.push(
        <View
          key={`${key}-badge-${badgeIndex}`}
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            zIndex: 10,
          }}
        >
          <AvatarBadgeVisual {...badge.props} size={avatarSize} />
        </View>
      )
    }
    return cloneElement(child, {
      style: [index > 0 && { marginLeft: -8 }, child.props.style],
      ...(lifted.length
        ? {
            children: parts.filter((part) => !lifted.includes(part)),
            onLayout: (event: LayoutChangeEvent) => {
              const next = event.nativeEvent.layout
              setLayouts((current) => {
                const previous = current[key]
                return previous &&
                  previous.x === next.x &&
                  previous.y === next.y &&
                  previous.width === next.width &&
                  previous.height === next.height
                  ? current
                  : { ...current, [key]: next }
              })
              child.props.onLayout?.(event)
            },
          }
        : {}),
    })
  })
  return (
    <GroupContext.Provider value={{ size }}>
      <View {...props} style={[{ flexDirection: "row" }, style]}>
        {avatars}
        {badges}
      </View>
    </GroupContext.Provider>
  )
}
export type AvatarGroupCountProps = ComponentPropsWithRef<typeof View>
function AvatarGroupCount({ children, style, ...props }: AvatarGroupCountProps) {
  const size = useContext(GroupContext)?.size ?? "default"
  const { colors, avatar, typography, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: avatar[size],
          height: avatar[size],
          flexShrink: 0,
          borderRadius: radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.muted,
          boxShadow: [{ offsetX: 0, offsetY: 0, spreadDistance: 2, color: colors.background }],
        },
        style,
      ]}
    >
      {Children.toArray(children).every((child) => typeof child === "string" || typeof child === "number") ? (
        <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
          {children}
        </Text>
      ) : (
        Children.map(children, (child) =>
          isValidElement<{ size?: number; color?: string }>(child)
            ? cloneElement(child, {
                size: size === "sm" ? 12 : size === "lg" ? 20 : 16,
                color: child.props.color ?? colors.mutedForeground,
              })
            : child
        )
      )}
    </View>
  )
}
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Badge: AvatarBadge,
  Group: AvatarGroup,
  GroupCount: AvatarGroupCount,
}
