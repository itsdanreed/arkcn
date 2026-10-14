/** Text entry with composable addons, actions, and one shared focus/validation outline. */
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { createRequiredContext } from "../../lib/context"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { Input, type InputRootProps } from "./input"

const AddonContext = createContext(false)

type Align = "inline-start" | "inline-end" | "block-start" | "block-end"
type ControlState = { disabled: boolean; invalid: boolean; focused: boolean; focus?: () => void }
const [Provider, useGroup] = createRequiredContext<{
  register: (id: string, state: ControlState | null) => void
  focus: () => void
  alignments: Align[]
  block: boolean
}>("InputGroup")
export type InputGroupRootProps = ComponentPropsWithRef<typeof View>
function InputGroupRoot({ children, style, ...props }: InputGroupRootProps) {
  const { colors, colorScheme, radius, controlHeight, opacity } = useNativeTheme()
  const { transition } = useMotion()
  const [controls, setControls] = useState<Record<string, ControlState>>({})
  const register = useCallback(
    (id: string, state: ControlState | null) =>
      setControls((current) => {
        if (!state) {
          const next = { ...current }
          delete next[id]
          return next
        }
        const previous = current[id]
        if (
          previous &&
          previous.disabled === state.disabled &&
          previous.invalid === state.invalid &&
          previous.focused === state.focused &&
          previous.focus === state.focus
        )
          return current
        return { ...current, [id]: state }
      }),
    []
  )
  const items = Children.toArray(children)
  const alignments = items.flatMap((child) =>
    isValidElement<InputGroupAddonProps>(child) && isPart(child.type, "InputGroupAddon")
      ? [child.props.align ?? "inline-start"]
      : []
  )
  const multiline = items.some((child) => isValidElement(child) && isPart(child.type, "InputGroupTextarea"))
  const block = multiline || alignments.some((align) => align.startsWith("block-"))
  const values = Object.values(controls)
  const disabled = values.some((state) => state.disabled)
  const invalid = values.some((state) => state.invalid)
  const focused = values.some((state) => state.focused)
  const ring = invalid || focused
  const ringColor = withOpacity(
    invalid ? colors.destructive : colors.ring,
    invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : 0.5
  )
  const order = (child: ReactNode) => {
    if (!isValidElement<InputGroupAddonProps>(child) || !isPart(child.type, "InputGroupAddon")) return 0
    return (child.props.align ?? "inline-start").endsWith("start") ? -1 : 1
  }
  return (
    <Provider
      value={{
        register,
        alignments,
        block,
        focus: () => values.find((state) => state.focus && !state.disabled)?.focus?.(),
      }}
    >
      <AnimatedView
        {...props}
        style={[
          transition(["borderColor", "backgroundColor"]),
          {
            width: "100%",
            minWidth: 0,
            minHeight: controlHeight.default,
            ...(!block && { height: controlHeight.default }),
            flexDirection: block ? "column" : "row",
            alignItems: "center",
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: invalid ? colors.destructive : focused ? colors.ring : colors.input,
            opacity: disabled ? opacity.disabled : 1,
            backgroundColor: disabled
              ? withOpacity(colors.input, colorScheme === "dark" ? 0.8 : 0.5)
              : colorScheme === "dark"
                ? withOpacity(colors.input, 0.3)
                : "transparent",
            boxShadow: ring ? `0px 0px 0px 3px ${ringColor}` : "none",
          },
          style,
        ]}
      >
        {items.sort((a, b) => order(a) - order(b))}
      </AnimatedView>
    </Provider>
  )
}
function isPart(type: unknown, name: string) {
  return typeof type === "function" && "displayName" in type && type.displayName === name
}
function InlineContent({
  children,
  medium = false,
  iconSize = 16,
}: {
  children: ReactNode
  medium?: boolean
  iconSize?: number
}) {
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  const label = (text: ReactNode) => (
    <Text
      style={{
        ...(medium ? typography.medium : typography.regular),
        fontSize: fontSize.md,
        lineHeight: lineHeight.md,
        color: colors.mutedForeground,
      }}
    >
      {text}
    </Text>
  )
  const items = Children.toArray(children)
  return (
    <>
      {items.every((child) => typeof child === "string" || typeof child === "number")
        ? label(children)
        : Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number"
              ? label(child)
              : isValidElement<{ size?: number; color?: string }>(child) &&
                  child.type !== Button &&
                  !isPart(child.type, "InputGroupTrigger") &&
                  !isPart(child.type, "InputGroupText")
                ? cloneElement(child, {
                    size: child.props.size ?? iconSize,
                    color: child.props.color ?? colors.mutedForeground,
                  })
                : child
          )}
    </>
  )
}
export type InputGroupAddonProps = ComponentPropsWithRef<typeof Pressable> & {
  /** Position relative to the input; default inline-start. */
  align?: Align
}
function InputGroupAddon({ align = "inline-start", children, style, onPress, ...props }: InputGroupAddonProps) {
  const group = useGroup()
  const { spacing } = useNativeTheme()
  const block = align.startsWith("block-")
  const hasButton =
    typeof children !== "function" &&
    Children.toArray(children).some(
      (child) => isValidElement(child) && (isPart(child.type, "InputGroupTrigger") || child.type === Button)
    )
  return (
    <Pressable
      accessible={false}
      focusable={false}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) group.focus()
      }}
      style={(state) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: block ? "flex-start" : "center",
          gap: spacing.sm,
          paddingVertical: 6,
        },
        block
          ? {
              width: "100%",
              paddingHorizontal: spacing.controlX,
              ...(align === "block-start" ? { paddingTop: spacing.sm } : { paddingBottom: spacing.sm }),
            }
          : align === "inline-start"
            ? { paddingLeft: spacing.sm, ...(hasButton && { marginLeft: -4.8 }) }
            : { paddingRight: spacing.sm, ...(hasButton && { marginRight: -4.8 }) },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {(state) => (
        <AddonContext value>
          <InlineContent medium>{typeof children === "function" ? children(state) : children}</InlineContent>
        </AddonContext>
      )}
    </Pressable>
  )
}
InputGroupAddon.displayName = "InputGroupAddon"
export type InputGroupTextProps = ComponentPropsWithRef<typeof View>
function InputGroupText({ children, style, ...props }: InputGroupTextProps) {
  const { spacing } = useNativeTheme()
  return (
    <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: spacing.sm }, style]}>
      <InlineContent medium={useContext(AddonContext)}>{children}</InlineContent>
    </View>
  )
}
InputGroupText.displayName = "InputGroupText"
export type InputGroupTriggerProps = Omit<ButtonProps, "size"> & {
  /** Compact action dimensions. */
  size?: "xs" | "sm" | "icon-xs" | "icon-sm"
}
function InputGroupTrigger({
  size = "xs",
  variant = "ghost",
  children,
  style,
  textStyle,
  onPress,
  disabled,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  ...props
}: InputGroupTriggerProps) {
  const { register } = useGroup()
  const { colors } = useNativeTheme()
  const id = useId()
  useLayoutEffect(() => {
    register(id, { disabled: !!disabled, invalid: false, focused: false })
    return () => register(id, null)
  }, [register, id, disabled])
  const [active, setActive] = useState(false)
  const icon = size.startsWith("icon")
  const color =
    variant === "ghost" && !active
      ? colors.mutedForeground
      : variant === "default"
        ? colors.primaryForeground
        : variant === "secondary"
          ? colors.secondaryForeground
          : variant === "destructive"
            ? colors.destructive
            : variant === "link"
              ? colors.primary
              : colors.foreground
  const content = (value: ReactNode) =>
    Children.map(value, (child) =>
      isValidElement<{ size?: number; color?: string }>(child)
        ? cloneElement(child, {
            size: child.props.size ?? (size === "xs" ? 14 : 16),
            color: child.props.color ?? color,
          })
        : child
    )
  return (
    <Button
      {...props}
      disabled={disabled}
      variant={variant}
      onHoverIn={(event) => {
        setActive(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setActive(false)
        onHoverOut?.(event)
      }}
      onPressIn={(event) => {
        setActive(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setActive(false)
        onPressOut?.(event)
      }}
      size={size === "sm" ? "default" : size === "icon-sm" ? "icon" : size}
      onPress={(event) => {
        event.stopPropagation?.()
        onPress?.(event)
      }}
      style={(state) => [
        {
          gap: size === "xs" ? 4 : 8,
          ...(size === "xs" || size === "icon-xs"
            ? { minHeight: 24, height: 24, borderRadius: 7, paddingHorizontal: icon ? 0 : 6 }
            : {}),
          ...(icon && { paddingHorizontal: 0 }),
        },
        typeof style === "function" ? style(state) : style,
      ]}
      textStyle={[{ fontSize: 14, lineHeight: 20, color }, textStyle]}
    >
      {(state) => content(typeof children === "function" ? children(state) : children)}
    </Button>
  )
}
InputGroupTrigger.displayName = "InputGroupTrigger"
export type InputGroupInputProps = InputRootProps
function InputGroupInput({
  ref,
  disabled = false,
  invalid = false,
  onFocus,
  onBlur,
  style,
  ...props
}: InputGroupInputProps) {
  return (
    <GroupControl
      {...props}
      ref={ref}
      disabled={disabled}
      invalid={invalid}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
    />
  )
}
export type InputGroupTextareaProps = InputRootProps
function InputGroupTextarea(props: InputGroupTextareaProps) {
  return <GroupControl {...props} multiline />
}
InputGroupTextarea.displayName = "InputGroupTextarea"
function GroupControl({
  ref,
  disabled = false,
  invalid = false,
  onFocus,
  onBlur,
  style,
  multiline,
  ...props
}: InputRootProps) {
  const { register, alignments, block } = useGroup()
  const input = useRef<ComponentRef<typeof TextInput> | null>(null)
  const [focused, setFocused] = useState(false)
  const id = useId()
  const focus = useCallback(() => input.current?.focus(), [])
  useLayoutEffect(() => {
    register(id, { disabled, invalid, focused, focus })
    return () => register(id, null)
  }, [register, id, disabled, invalid, focused, focus])
  return (
    <Input.Root
      {...props}
      disabled={disabled}
      invalid={invalid}
      multiline={multiline}
      ref={(value) => {
        input.current = value
        if (typeof ref === "function") return ref(value)
        if (ref) ref.current = value
      }}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        {
          flex: block ? undefined : 1,
          minWidth: 0,
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: "transparent",
          opacity: 1,
          boxShadow: "none",
        },
        multiline
          ? { minHeight: 64, width: "100%", textAlignVertical: "top", paddingVertical: 8 }
          : {
              ...(block && { width: "100%" }),
              ...(alignments.includes("inline-start") && { paddingLeft: 6 }),
              ...(alignments.includes("inline-end") && { paddingRight: 6 }),
              ...(alignments.includes("block-start") && { paddingBottom: 12 }),
              ...(alignments.includes("block-end") && { paddingTop: 12 }),
            },
        style,
      ]}
    />
  )
}
export const InputGroup = {
  Root: InputGroupRoot,
  Addon: InputGroupAddon,
  Trigger: InputGroupTrigger,
  Text: InputGroupText,
  Input: InputGroupInput,
  Textarea: InputGroupTextarea,
}
