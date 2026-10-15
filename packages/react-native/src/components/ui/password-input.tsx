/** Secure native text entry with the audited input styling and a visibility action. */
import {
  Children,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { Platform, TextInput, View } from "react-native"
import { Eye, EyeOff } from "lucide-react-native"
import { createRequiredContext } from "../../lib/context"
import { useControllable } from "../../lib/controllable"
import { useNativeTheme } from "../../lib/theme"
import { InputGroup, type InputGroupInputProps, type InputGroupTriggerProps } from "./input-group"
import { Label as NativeLabel, type LabelRootProps } from "./label"
import { useFieldsetContext } from "./fieldset"

export type UsePasswordInputProps = {
  visible?: boolean
  defaultVisible?: boolean
  onVisibilityChange?: (details: { visible: boolean }) => void
  disabled?: boolean
  invalid?: boolean
  readOnly?: boolean
  required?: boolean
  translations?: { visibilityTrigger?: (visible: boolean) => string }
}
export function usePasswordInput({
  visible,
  defaultVisible = false,
  onVisibilityChange,
  disabled = false,
  invalid = false,
  readOnly = false,
  required = false,
  translations,
}: UsePasswordInputProps = {}) {
  const parent = useFieldsetContext()
  const [shown, setShown] = useControllable(visible, defaultVisible, (visible) => onVisibilityChange?.({ visible }))
  const input = useRef<ComponentRef<typeof TextInput> | null>(null)
  const id = useId()
  const [label, setLabel] = useState("")
  const blocked = disabled || parent.disabled
  return {
    visible: shown,
    disabled: blocked,
    invalid,
    readOnly,
    required,
    input,
    id,
    label,
    setLabel,
    translations,
    focus: () => {
      if (!blocked) input.current?.focus()
    },
    setVisible: (value: boolean) => {
      if (!blocked && !readOnly) setShown(value)
    },
    toggleVisible: () => {
      if (!blocked && !readOnly) setShown(!shown)
    },
  }
}
export type UsePasswordInputReturn = ReturnType<typeof usePasswordInput>
const [Provider, usePasswordInputContext] = createRequiredContext<UsePasswordInputReturn>("PasswordInput")
export { usePasswordInputContext }
export type PasswordInputRootProps = ComponentPropsWithRef<typeof View> & UsePasswordInputProps
function Root({
  visible,
  defaultVisible,
  onVisibilityChange,
  disabled,
  invalid,
  readOnly,
  required,
  translations,
  ...props
}: PasswordInputRootProps) {
  const value = usePasswordInput({
    visible,
    defaultVisible,
    onVisibilityChange,
    disabled,
    invalid,
    readOnly,
    required,
    translations,
  })
  return <RootProvider {...props} value={value} />
}
export type PasswordInputRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UsePasswordInputReturn }
function RootProvider({ value, children, style, ...props }: PasswordInputRootProviderProps) {
  return (
    <Provider value={value}>
      <View {...props} style={[{ width: "100%", gap: 6 }, style]}>
        {children ?? (
          <Control>
            <Input />
            <VisibilityTrigger />
          </Control>
        )}
      </View>
    </Provider>
  )
}
export type PasswordInputContextProps = { children: (context: UsePasswordInputReturn) => ReactNode }
function Context({ children }: PasswordInputContextProps) {
  return children(usePasswordInputContext())
}
export type PasswordInputControlProps = ComponentPropsWithRef<typeof View>
function Control(props: PasswordInputControlProps) {
  return <InputGroup.Root {...props} />
}
function contentText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? contentText(child.props.children)
          : ""
    )
    .join("")
}
export type PasswordInputLabelProps = LabelRootProps
function Label({ children, ...props }: PasswordInputLabelProps) {
  const state = usePasswordInputContext()
  const { setLabel } = state
  const text = contentText(children)
  useLayoutEffect(() => {
    setLabel(text)
    return () => setLabel("")
  }, [setLabel, text])
  return (
    <NativeLabel.Root nativeID={`${state.id}-label`} controlRef={state.input} disabled={state.disabled} {...props}>
      {children}
    </NativeLabel.Root>
  )
}
export type PasswordInputInputProps = Omit<InputGroupInputProps, "secureTextEntry" | "multiline">
function Input({
  ref,
  value,
  defaultValue,
  onChangeText,
  disabled,
  invalid,
  editable,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...props
}: PasswordInputInputProps) {
  const state = usePasswordInputContext()
  const blocked = state.disabled || disabled
  const readOnly = state.readOnly || editable === false || props.readOnly
  // Keep one controlled native input mounted when secure entry changes, preserving its value.
  const [text, setText] = useControllable(value, defaultValue ?? "", onChangeText)
  return (
    <InputGroup.Input
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      autoComplete="current-password"
      textContentType="password"
      nativeID={`${state.id}-input`}
      {...props}
      style={[
        // UITextField centers its native font metrics. A forced paragraph line height
        // shifts the baseline below the adjacent visibility icon.
        Platform.OS === "ios" && { lineHeight: undefined, paddingVertical: 0 },
        style,
      ]}
      value={text}
      secureTextEntry={!state.visible}
      disabled={blocked}
      invalid={state.invalid || invalid}
      editable={!readOnly}
      accessibilityLabel={accessibilityLabel ?? (state.label || "Password")}
      accessibilityHint={
        accessibilityHint ?? (state.invalid ? "Invalid password" : state.required ? "Required" : undefined)
      }
      aria-required={state.required}
      aria-invalid={state.invalid || invalid}
      onChangeText={(next) => {
        if (!blocked && !readOnly) setText(next)
      }}
      ref={(node) => {
        state.input.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
    />
  )
}
export type PasswordInputVisibilityTriggerProps = InputGroupTriggerProps
function VisibilityTrigger({
  children,
  disabled,
  onPress,
  accessibilityLabel,
  ...props
}: PasswordInputVisibilityTriggerProps) {
  const state = usePasswordInputContext()
  const blocked = state.disabled || disabled
  return (
    <InputGroup.Addon align="inline-end">
      <InputGroup.Trigger
        size="icon-xs"
        {...props}
        disabled={blocked}
        accessibilityLabel={
          accessibilityLabel ??
          state.translations?.visibilityTrigger?.(state.visible) ??
          (state.visible ? "Hide password" : "Show password")
        }
        aria-controls={`${state.id}-input`}
        onPress={(event) => {
          if (blocked || state.readOnly) return
          onPress?.(event)
          if (!event.defaultPrevented) state.toggleVisible()
        }}
      >
        {children ?? <Indicator />}
      </InputGroup.Trigger>
    </InputGroup.Addon>
  )
}
export type PasswordInputIndicatorProps = ComponentPropsWithRef<typeof View> & { fallback?: ReactNode }
function Indicator({ children, fallback, ...props }: PasswordInputIndicatorProps) {
  const { visible } = usePasswordInputContext()
  const { colors } = useNativeTheme()
  return (
    <View accessible={false} aria-hidden {...props}>
      {visible
        ? (children ?? <EyeOff size={16} color={colors.mutedForeground} />)
        : (fallback ?? <Eye size={16} color={colors.mutedForeground} />)}
    </View>
  )
}
export const PasswordInput = { Root, RootProvider, Context, Control, Input, Label, VisibilityTrigger, Indicator }
