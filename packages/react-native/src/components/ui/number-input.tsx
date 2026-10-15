/** Numeric entry with bounded decimal stepping, native editing, and shared control styling. */
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react"
import { Platform, Pressable, Text, TextInput, View } from "react-native"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Input, type InputRootProps } from "./input"
import { Label } from "./label"
import { useFieldsetContext } from "./fieldset"

type ValueChange = { value: string; valueAsNumber: number }
const number = (value: string) => (value.trim() === "" ? NaN : Number(value.replace(",", ".")))
const precision = (value: number) => {
  const [mantissa, exponent = "0"] = String(value).split("e")
  return Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent))
}
type NumberInputState = ValueChange & {
  min: number
  max: number
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  focused: boolean
  spinOnPress: boolean
  label: string
  id: string
  setLabel: (label: string) => void
  setFocused: (focused: boolean) => void
  setValue: (value: string) => void
  commit: () => void
  increment: () => void
  decrement: () => void
  input: RefObject<ComponentRef<typeof TextInput> | null>
}
const [Provider, useNumberInputContext] = createRequiredContext<NumberInputState>("NumberInput")
export { useNumberInputContext }
export type NumberInputRootProps = ComponentPropsWithRef<typeof View> & {
  value?: string
  defaultValue?: string
  onValueChange?: (details: ValueChange) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  clampValueOnBlur?: boolean
  spinOnPress?: boolean
}
function NumberInputRoot({
  value,
  defaultValue = "",
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  readOnly = false,
  invalid = false,
  clampValueOnBlur = true,
  spinOnPress = true,
  children,
  style,
  ...props
}: NumberInputRootProps) {
  if (!(min <= max) || min === Infinity || max === -Infinity || !Number.isFinite(step) || step <= 0)
    throw new RangeError("NumberInput requires min <= max and a positive finite step")
  const parent = useFieldsetContext()
  const blocked = disabled || parent.disabled
  const [current, update] = useControllable(value, defaultValue, (value) =>
    onValueChange?.({ value, valueAsNumber: number(value) })
  )
  const [focused, setFocused] = useState(false)
  const [label, setLabel] = useState("")
  const input = useRef<ComponentRef<typeof TextInput> | null>(null)
  const id = useId()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const adjust = (direction: number) => {
    if (blocked || readOnly) return
    update((previous) => {
      const n = number(previous)
      const next = Number.isFinite(n)
        ? Number((n + direction * step).toFixed(Math.min(15, Math.max(precision(n), precision(step)))))
        : 0
      const bounded = clamp(next)
      return Number.isFinite(bounded) ? String(bounded) : previous
    })
  }
  return (
    <Provider
      value={{
        value: current,
        valueAsNumber: number(current),
        min,
        max,
        disabled: blocked,
        readOnly,
        invalid,
        focused,
        spinOnPress,
        label,
        id,
        input,
        setLabel,
        setFocused,
        setValue: (next) => {
          // Preserve incomplete decimals while editing; reject nonnumeric pasted text.
          if (!blocked && !readOnly && /^[+-]?\d*(?:[.,]\d*)?$/.test(next)) update(next)
        },
        commit: () => {
          if (blocked || readOnly || current === "") return
          const n = number(current)
          update(Number.isFinite(n) ? String(clampValueOnBlur ? clamp(n) : n) : "")
        },
        increment: () => adjust(1),
        decrement: () => adjust(-1),
      }}
    >
      <View {...props} style={[{ width: "100%", gap: 6 }, style]}>
        {children ?? (
          <NumberInputControl>
            <NumberInputInput />
            <NumberInputTriggers />
          </NumberInputControl>
        )}
      </View>
    </Provider>
  )
}
export type NumberInputContextProps = { children: (context: NumberInputState) => ReactNode }
function NumberInputContext({ children }: NumberInputContextProps) {
  return children(useNumberInputContext())
}
export type NumberInputLabelProps = ComponentPropsWithRef<typeof Text>
function NumberInputLabel({ children, accessibilityLabel, ...props }: NumberInputLabelProps) {
  const { setLabel, input, disabled, id } = useNumberInputContext()
  const label =
    accessibilityLabel ?? (typeof children === "string" || typeof children === "number" ? String(children) : "")
  useLayoutEffect(() => {
    setLabel(label)
    return () => setLabel("")
  }, [label, setLabel])
  return (
    <Label.Root
      {...props}
      nativeID={`${id}-label`}
      accessibilityLabel={accessibilityLabel}
      controlRef={input}
      disabled={disabled}
    >
      {children}
    </Label.Root>
  )
}
export type NumberInputControlProps = ComponentPropsWithRef<typeof View>
function NumberInputControl({ style, ...props }: NumberInputControlProps) {
  const { disabled, invalid, focused } = useNumberInputContext()
  const { colors, colorScheme, radius, controlHeight, opacity } = useNativeTheme()
  const { transition } = useMotion()
  const dark = colorScheme === "dark"
  const ring = withOpacity(invalid ? colors.destructive : colors.ring, invalid ? (dark ? 0.4 : 0.2) : 0.5)
  return (
    <AnimatedView
      {...props}
      style={[
        transition(["borderColor", "backgroundColor"]),
        {
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          height: controlHeight.default,
          borderWidth: 1,
          borderRadius: radius.lg,
          borderColor: invalid
            ? dark
              ? withOpacity(colors.destructive, 0.5)
              : colors.destructive
            : focused
              ? colors.ring
              : colors.input,
          backgroundColor: disabled
            ? withOpacity(colors.input, dark ? 0.8 : 0.5)
            : dark
              ? withOpacity(colors.input, 0.3)
              : "transparent",
          opacity: disabled ? opacity.disabled : 1,
          boxShadow: invalid || focused ? `0px 0px 0px 3px ${ring}` : "none",
        },
        style,
      ]}
    />
  )
}
export type NumberInputInputProps = Omit<
  InputRootProps,
  "value" | "defaultValue" | "disabled" | "invalid" | "multiline"
>
function NumberInputInput({
  ref,
  style,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  onKeyPress,
  onAccessibilityAction,
  accessibilityLabel,
  editable,
  ...props
}: NumberInputInputProps) {
  const group = useNumberInputContext()
  return (
    <Input.Root
      keyboardType={group.min < 0 ? (Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric") : "decimal-pad"}
      accessibilityRole={Platform.OS === "web" ? "spinbutton" : undefined}
      accessibilityLabel={accessibilityLabel ?? group.label}
      accessibilityLabelledBy={group.label ? `${group.id}-label` : undefined}
      accessibilityValue={{
        text: group.value,
        ...(Number.isFinite(group.min) && Number.isFinite(group.max) && Number.isFinite(group.valueAsNumber)
          ? { min: group.min, max: group.max, now: group.valueAsNumber }
          : {}),
      }}
      {...(Platform.OS === "web" && {
        "aria-valuemin": Number.isFinite(group.min) ? group.min : undefined,
        "aria-valuemax": Number.isFinite(group.max) ? group.max : undefined,
        "aria-valuenow": Number.isFinite(group.valueAsNumber) ? group.valueAsNumber : undefined,
        "aria-valuetext": group.value,
      })}
      accessibilityActions={group.disabled || group.readOnly ? [] : [{ name: "increment" }, { name: "decrement" }]}
      {...props}
      ref={(node) => {
        group.input.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      value={group.value}
      disabled={group.disabled}
      editable={!group.readOnly && editable !== false}
      onChangeText={(next) => {
        group.setValue(next)
        onChangeText?.(next)
      }}
      onFocus={(event) => {
        group.setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        group.setFocused(false)
        group.commit()
        onBlur?.(event)
      }}
      onSubmitEditing={(event) => {
        group.commit()
        onSubmitEditing?.(event)
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (event.defaultPrevented) return
        if (event.nativeEvent.key === "ArrowUp") {
          event.preventDefault()
          group.increment()
        }
        if (event.nativeEvent.key === "ArrowDown") {
          event.preventDefault()
          group.decrement()
        }
      }}
      onAccessibilityAction={(event) => {
        onAccessibilityAction?.(event)
        if (event.defaultPrevented) return
        if (event.nativeEvent.actionName === "increment") group.increment()
        if (event.nativeEvent.actionName === "decrement") group.decrement()
      }}
      style={[
        {
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          borderWidth: 0,
          backgroundColor: "transparent",
          opacity: 1,
          boxShadow: "none",
        },
        style,
      ]}
    />
  )
}
export type NumberInputTriggersProps = ComponentPropsWithRef<typeof View>
function NumberInputTriggers({ children, style, ...props }: NumberInputTriggersProps) {
  const { colors, radius } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: 24,
          borderLeftWidth: 1,
          borderColor: colors.input,
          borderTopRightRadius: radius.lg - 1,
          borderBottomRightRadius: radius.lg - 1,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children ?? (
        <>
          <NumberInputIncrementTrigger />
          <NumberInputDecrementTrigger />
        </>
      )}
    </View>
  )
}
type TriggerProps = ComponentPropsWithRef<typeof Pressable>
function NumberInputTrigger({
  direction,
  children,
  style,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: TriggerProps & { direction: 1 | -1 }) {
  const group = useNumberInputContext()
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const held = useRef(false)
  const blocked = !!(
    disabled ||
    group.disabled ||
    group.readOnly ||
    (direction === 1 ? group.valueAsNumber >= group.max : group.valueAsNumber <= group.min)
  )
  const adjust = useRef(() => {})
  adjust.current = () => {
    if (!blocked) (direction === 1 ? group.increment : group.decrement)()
  }
  const stop = () => {
    clearInterval(timer.current)
    timer.current = undefined
  }
  useEffect(() => {
    if (blocked) {
      stop()
      setPressed(false)
    }
  }, [blocked])
  useEffect(() => stop, [])
  const Icon = direction === 1 ? ChevronUpIcon : ChevronDownIcon
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={direction === 1 ? "Increase value" : "Decrease value"}
      delayLongPress={400}
      {...props}
      disabled={blocked}
      accessibilityState={{ ...props.accessibilityState, disabled: blocked }}
      onPressIn={(event) => {
        held.current = false
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        stop()
        setPressed(false)
        onPressOut?.(event)
      }}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented && !held.current) adjust.current()
      }}
      onLongPress={(event) => {
        onLongPress?.(event)
        if (event.defaultPrevented || blocked || !group.spinOnPress) return
        held.current = true
        adjust.current()
        stop()
        timer.current = setInterval(() => adjust.current(), 100)
      }}
      onHoverIn={(event) => {
        setHovered(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        onHoverOut?.(event)
      }}
      onFocus={(event) => {
        group.setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        stop()
        setPressed(false)
        group.setFocused(false)
        onBlur?.(event)
      }}
      style={[
        transition(["backgroundColor"]),
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderColor: colors.input,
          borderBottomWidth: direction === 1 ? 1 : 0,
          opacity: blocked ? 0.5 : 1,
          backgroundColor: !blocked && (hovered || pressed) ? colors.muted : "transparent",
        },
        Platform.OS === "web" && { outlineWidth: 0 },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {(state) =>
        (typeof children === "function" ? children(state) : children) ?? (
          <Icon size={12} color={!blocked && (hovered || pressed) ? colors.foreground : colors.mutedForeground} />
        )
      }
    </AnimatedPressable>
  )
}
export type NumberInputIncrementTriggerProps = TriggerProps
function NumberInputIncrementTrigger(props: NumberInputIncrementTriggerProps) {
  return <NumberInputTrigger {...props} direction={1} />
}
export type NumberInputDecrementTriggerProps = TriggerProps
function NumberInputDecrementTrigger(props: NumberInputDecrementTriggerProps) {
  return <NumberInputTrigger {...props} direction={-1} />
}
export type NumberInputValueTextProps = ComponentPropsWithRef<typeof Text>
function NumberInputValueText({ children, style, ...props }: NumberInputValueTextProps) {
  const { value } = useNumberInputContext()
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        { ...typography.regular, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.mutedForeground },
        style,
      ]}
    >
      {children ?? value}
    </Text>
  )
}
export const NumberInput = {
  Root: NumberInputRoot,
  Context: NumberInputContext,
  Label: NumberInputLabel,
  Control: NumberInputControl,
  Input: NumberInputInput,
  Triggers: NumberInputTriggers,
  IncrementTrigger: NumberInputIncrementTrigger,
  DecrementTrigger: NumberInputDecrementTrigger,
  ValueText: NumberInputValueText,
}
