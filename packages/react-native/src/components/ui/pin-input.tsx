/** Segmented native code entry, composed from the standard Input. */
import { useEffect, useRef, useState, type ComponentPropsWithRef, type ComponentRef, type ReactNode } from "react"
import { I18nManager, TextInput, View } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { Input, type InputRootProps } from "./input"
import { Label, type LabelRootProps } from "./label"
import { useFieldsetContext } from "./fieldset"

type ValueDetails = { value: string[]; valueAsString: string }
type PinType = "numeric" | "alphabetic" | "alphanumeric"
export type UsePinInputProps = {
  /** Number of cells. Render one Input for each index from 0 to count - 1. */
  count?: number
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: ValueDetails) => void
  onValueComplete?: (details: ValueDetails) => void
  onValueInvalid?: (details: { value: string; index: number }) => void
  type?: PinType
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  otp?: boolean
  mask?: boolean
  placeholder?: string
  blurOnComplete?: boolean
}
const pattern = { numeric: /^[0-9]$/, alphabetic: /^[a-z]$/i, alphanumeric: /^[a-z0-9]$/i }

export function usePinInput({
  count: requestedCount = 6,
  value: controlled,
  defaultValue = [],
  onValueChange,
  onValueComplete,
  onValueInvalid,
  type = "numeric",
  disabled = false,
  readOnly = false,
  invalid = false,
  otp = false,
  mask = false,
  placeholder = "○",
  blurOnComplete = false,
}: UsePinInputProps = {}) {
  const count = Number.isFinite(requestedCount) ? Math.max(1, Math.trunc(requestedCount)) : 6
  const [raw, update] = useControllable(controlled, defaultValue, (value) =>
    onValueChange?.({ value, valueAsString: value.join("") })
  )
  const value = Array.from({ length: count }, (_, index) => Array.from(raw[index] ?? "")[0] ?? "")
  const inputs = useRef(new Map<number, ComponentRef<typeof TextInput>>())
  const frame = useRef<ReturnType<typeof requestAnimationFrame> | undefined>(undefined)
  const [label, setLabel] = useState("")
  const blocked = disabled || readOnly
  useEffect(
    () => () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    },
    []
  )
  const focus = (index = 0) => {
    if (blocked) return
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    const target = Math.min(count - 1, Math.max(0, index))
    inputs.current.get(target)?.focus()
    frame.current = requestAnimationFrame(() => inputs.current.get(target)?.setSelection(0, 1))
  }
  const write = (next: string[]) => {
    if (blocked || next.every((cell, index) => cell === value[index])) return
    update(next)
    if (next.every((cell) => pattern[type].test(cell))) {
      onValueComplete?.({ value: next, valueAsString: next.join("") })
      if (blurOnComplete) inputs.current.forEach((input) => input.blur())
    }
  }
  const change = (index: number, text: string) => {
    if (blocked || index < 0 || index >= count) return
    // Formatted codes may contain spaces or dashes. Reject other characters
    // instead of silently accepting an incorrect verification code.
    const characters = Array.from(text.replace(/[\s-]/g, ""))
    if (characters.some((character) => !pattern[type].test(character))) {
      onValueInvalid?.({ value: text, index })
      return
    }
    const next = [...value]
    if (!characters.length) {
      next[index] = ""
      write(next)
      focus(index - 1)
      return
    }
    // OS one-time-code autofill can target whichever cell currently has focus.
    const start = characters.length >= count ? 0 : index
    characters.slice(0, count - start).forEach((character, offset) => {
      next[start + offset] = character
    })
    write(next)
    if (!(blurOnComplete && next.every(Boolean))) focus(Math.min(start + characters.length, count - 1))
  }
  return {
    value,
    valueAsString: value.join(""),
    count,
    type,
    disabled,
    readOnly,
    invalid,
    otp,
    mask,
    placeholder,
    complete: value.every((cell) => pattern[type].test(cell)),
    label,
    setLabel,
    inputs,
    focus,
    change,
    clearValue: () => write(Array(count).fill("")),
    setValue: (next: string[]) =>
      write(Array.from({ length: count }, (_, index) => Array.from(next[index] ?? "")[0] ?? "")),
    backspace: (index: number) => {
      if (blocked || value[index]) return
      const previous = Math.max(0, index - 1)
      const next = [...value]
      next[previous] = ""
      write(next)
      focus(previous)
    },
  }
}
export type UsePinInputReturn = ReturnType<typeof usePinInput>
const [Provider, usePinInputContext] = createRequiredContext<UsePinInputReturn>("PinInput")
export { usePinInputContext }
export type PinInputRootProps = ComponentPropsWithRef<typeof View> & UsePinInputProps
function PinInputRoot({
  count,
  value,
  defaultValue,
  onValueChange,
  onValueComplete,
  onValueInvalid,
  type,
  disabled,
  readOnly,
  invalid,
  otp,
  mask,
  placeholder,
  blurOnComplete,
  ...props
}: PinInputRootProps) {
  const parent = useFieldsetContext()
  const state = usePinInput({
    count,
    value,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueInvalid,
    type,
    disabled: disabled || parent.disabled,
    readOnly,
    invalid: invalid || parent.invalid,
    otp,
    mask,
    placeholder,
    blurOnComplete,
  })
  return <PinInputRootProvider {...props} value={state} />
}
export type PinInputRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UsePinInputReturn }
function PinInputRootProvider({ value, style, ...props }: PinInputRootProviderProps) {
  return (
    <Provider value={value}>
      <View {...props} style={[{ gap: 6 }, style]} />
    </Provider>
  )
}
export type PinInputContextProps = { children: (state: UsePinInputReturn) => ReactNode }
function PinInputContext({ children }: PinInputContextProps) {
  return children(usePinInputContext())
}
export type PinInputControlProps = ComponentPropsWithRef<typeof View>
function PinInputControl({ style, ...props }: PinInputControlProps) {
  return <View {...props} style={[{ flexDirection: "row", gap: 8 }, style]} />
}
export type PinInputLabelProps = LabelRootProps
function PinInputLabel({ children, onPress, ...props }: PinInputLabelProps) {
  const state = usePinInputContext()
  const { setLabel } = state
  useEffect(() => {
    if (typeof children === "string") setLabel(children)
  }, [children, setLabel])
  return (
    <Label.Root
      {...props}
      disabled={state.disabled}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) state.focus()
      }}
    >
      {children}
    </Label.Root>
  )
}
export type PinInputInputProps = Omit<
  InputRootProps,
  "value" | "defaultValue" | "disabled" | "invalid" | "multiline" | "secureTextEntry" | "maxLength"
> & { index: number }
function PinInputInput({
  index,
  ref,
  style,
  onChangeText,
  onKeyPress,
  onFocus,
  editable,
  accessibilityLabel,
  ...props
}: PinInputInputProps) {
  const state = usePinInputContext()
  if (!Number.isInteger(index) || index < 0 || index >= state.count)
    throw new Error("PinInput.Input index must be within Root's count")
  return (
    <Input.Root
      autoCorrect={false}
      autoCapitalize="none"
      keyboardType={state.type === "numeric" ? "number-pad" : "default"}
      autoComplete={state.otp ? "one-time-code" : "off"}
      textContentType={state.otp ? "oneTimeCode" : "none"}
      selectTextOnFocus
      caretHidden
      placeholder={state.placeholder}
      accessibilityLabel={accessibilityLabel ?? `${state.label || "Code"}, character ${index + 1} of ${state.count}`}
      accessibilityHint={state.invalid ? "Invalid code" : undefined}
      {...props}
      ref={(node) => {
        if (node) state.inputs.current.set(index, node)
        else state.inputs.current.delete(index)
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      value={state.value[index]}
      disabled={state.disabled}
      invalid={state.invalid}
      editable={!state.readOnly && editable !== false}
      secureTextEntry={state.mask}
      maxLength={Math.max(state.count, 32)}
      onChangeText={(text) => {
        state.change(index, text)
        onChangeText?.(text)
      }}
      onFocus={(event) => {
        state.focus(index)
        onFocus?.(event)
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (event.defaultPrevented) return
        const key = event.nativeEvent.key
        if (key === "Backspace" && !state.value[index]) {
          event.preventDefault()
          state.backspace(index)
        }
        if (key === "ArrowLeft" || key === "ArrowRight") {
          event.preventDefault()
          state.focus(index + ((key === "ArrowRight") !== I18nManager.isRTL ? 1 : -1))
        }
      }}
      style={[{ width: 32, paddingHorizontal: 0, textAlign: "center" }, style]}
    />
  )
}
/** Native forms consume value/onValueChange directly; no DOM HiddenInput is needed. */
export const PinInput = {
  Root: PinInputRoot,
  RootProvider: PinInputRootProvider,
  Context: PinInputContext,
  Control: PinInputControl,
  Input: PinInputInput,
  Label: PinInputLabel,
}
