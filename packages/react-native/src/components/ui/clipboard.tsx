/** Copyable text with standard arkcn controls and confirmed native clipboard feedback. */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { I18nManager, Platform, Text, View } from "react-native"
import { setStringAsync } from "expo-clipboard"
import { CheckIcon, CopyIcon } from "lucide-react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { Input, type InputRootProps } from "./input"
import { Label as NativeLabel, type LabelRootProps } from "./label"
import { useFieldsetContext } from "./fieldset"

export type UseClipboardProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string }) => void
  onStatusChange?: (details: { copied: boolean }) => void
  onCopy?: (details: { value: string }) => void
  onCopyError?: (details: { error: Error }) => void
  /** Duration of the success indication, in milliseconds. Defaults to 3000. */
  timeout?: number
  disabled?: boolean
  translations?: { triggerLabel?: (copied: boolean) => string; errorLabel?: string }
}

/** Copies only on explicit activation; never reads or monitors the system clipboard. */
export function useClipboard({
  value: controlled,
  defaultValue = "",
  onValueChange,
  timeout = 3000,
  disabled = false,
  ...options
}: UseClipboardProps = {}) {
  const [value, setValue] = useControllable(controlled, defaultValue, (value) => onValueChange?.({ value }))
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [label, setLabel] = useState("")
  const id = useId()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(false)
  const inFlight = useRef(false)
  const generation = useRef(0)
  const latest = useRef({ ...options, value, disabled, timeout })
  latest.current = { ...options, value, disabled, timeout }
  const copiedRef = useRef(false)
  const clearStatus = () => {
    clearTimeout(timer.current)
    setCopiedValue(null)
    if (copiedRef.current) latest.current.onStatusChange?.({ copied: false })
    copiedRef.current = false
  }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])
  useEffect(() => {
    generation.current++
    clearStatus()
    setError(null)
  }, [value, disabled]) // A changed value must not retain a previous copy's success state.

  const copy = async () => {
    if (latest.current.disabled || inFlight.current || !mounted.current) return false
    inFlight.current = true
    const request = generation.current
    const text = latest.current.value
    clearStatus()
    setPending(true)
    setError(null)
    let success = false
    let failure: Error | null = null
    try {
      success = await setStringAsync(text)
      if (!success) failure = new Error("Could not copy to clipboard")
    } catch (cause) {
      failure = cause instanceof Error ? cause : new Error(String(cause))
    } finally {
      inFlight.current = false
      if (mounted.current) setPending(false)
    }
    // Ignore completions after unmount or a value/disabled change, including A → B → A.
    if (!mounted.current || request !== generation.current || text !== latest.current.value || latest.current.disabled)
      return false
    if (failure) {
      setError(failure)
      latest.current.onCopyError?.({ error: failure })
      return false
    }
    setCopiedValue(text)
    copiedRef.current = true
    const duration = Number.isFinite(latest.current.timeout) ? Math.max(0, latest.current.timeout) : 3000
    timer.current = setTimeout(clearStatus, duration)
    latest.current.onStatusChange?.({ copied: true })
    latest.current.onCopy?.({ value: text })
    return true
  }
  return {
    value,
    setValue,
    copied: copiedValue !== null && copiedValue === value && !disabled,
    pending,
    error,
    disabled,
    copy,
    label,
    setLabel,
    labelId: `${id}-label`,
    translations: options.translations,
  }
}
export type ClipboardApi = ReturnType<typeof useClipboard>
const [Provider, useClipboardContext] = createRequiredContext<ClipboardApi>("Clipboard")
export { useClipboardContext }
export type ClipboardRootProps = ComponentPropsWithRef<typeof View> & UseClipboardProps
function Root({
  value,
  defaultValue,
  onValueChange,
  onStatusChange,
  onCopy,
  onCopyError,
  timeout,
  disabled,
  translations,
  ...props
}: ClipboardRootProps) {
  const fieldset = useFieldsetContext()
  const api = useClipboard({
    value,
    defaultValue,
    onValueChange,
    onStatusChange,
    onCopy,
    onCopyError,
    timeout,
    disabled: disabled || fieldset.disabled,
    translations,
  })
  return <RootProvider {...props} value={api} />
}
export type ClipboardRootProviderProps = ComponentPropsWithRef<typeof View> & { value: ClipboardApi }
function RootProvider({ value, style, ...props }: ClipboardRootProviderProps) {
  return (
    <Provider value={value}>
      <View {...props} style={[{ width: "100%", gap: 6 }, style]} />
    </Provider>
  )
}
export type ClipboardContextProps = { children: (api: ClipboardApi) => ReactNode }
function Context({ children }: ClipboardContextProps) {
  return children(useClipboardContext())
}
export type ClipboardLabelProps = LabelRootProps
function Label({ children, accessibilityLabel, ...props }: ClipboardLabelProps) {
  const { setLabel, labelId } = useClipboardContext()
  const label =
    accessibilityLabel ?? (typeof children === "string" || typeof children === "number" ? String(children) : "")
  useLayoutEffect(() => {
    setLabel(label)
    return () => setLabel("")
  }, [label, setLabel])
  return (
    <NativeLabel.Root nativeID={labelId} {...props} accessibilityLabel={accessibilityLabel}>
      {children}
    </NativeLabel.Root>
  )
}
export type ClipboardControlProps = ComponentPropsWithRef<typeof View>
function Control({ style, ...props }: ClipboardControlProps) {
  return (
    <View
      {...props}
      style={[{ flexDirection: I18nManager.isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }, style]}
    />
  )
}
export type ClipboardInputProps = Omit<
  InputRootProps,
  "value" | "defaultValue" | "editable" | "readOnly" | "onChangeText"
>
function ClipboardInput({ style, ...props }: ClipboardInputProps) {
  const api = useClipboardContext()
  return (
    <Input.Root
      accessibilityLabel={api.label || "Clipboard value"}
      disabled={api.disabled}
      selectTextOnFocus
      {...props}
      value={api.value}
      readOnly
      editable={false}
      style={[{ flex: 1, minWidth: 0 }, style]}
    />
  )
}
export type ClipboardTriggerProps = ButtonProps
function Trigger({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityState,
  ...props
}: ClipboardTriggerProps) {
  const api = useClipboardContext()
  const { colors } = useNativeTheme()
  const label = api.error
    ? (api.translations?.errorLabel ?? "Copy failed. Try again")
    : (api.translations?.triggerLabel?.(api.copied) ?? (api.copied ? "Copied to clipboard" : "Copy to clipboard"))
  return (
    <Button
      variant="outline"
      size="icon"
      {...props}
      disabled={disabled || api.disabled || api.pending}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ ...accessibilityState, busy: api.pending }}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented && !disabled) void api.copy()
      }}
    >
      {children ?? (
        <Indicator copied={<CheckIcon size={16} color={colors.foreground} />}>
          <CopyIcon size={16} color={colors.foreground} />
        </Indicator>
      )}
    </Button>
  )
}
export type ClipboardIndicatorProps = ComponentPropsWithRef<typeof View> & { copied: ReactNode }
function Indicator({ copied, children, style, ...props }: ClipboardIndicatorProps) {
  const api = useClipboardContext()
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  const content = api.copied ? copied : children
  return (
    <View
      accessible={false}
      pointerEvents="none"
      {...props}
      style={[{ alignItems: "center", justifyContent: "center" }, style]}
    >
      {typeof content === "string" || typeof content === "number" ? (
        <Text
          style={{ ...typography.medium, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.foreground }}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </View>
  )
}
export type ClipboardValueTextProps = ComponentPropsWithRef<typeof Text>
function ValueText({ children, style, ...props }: ClipboardValueTextProps) {
  const api = useClipboardContext()
  const { colors, fontSize, lineHeight } = useNativeTheme()
  return (
    <Text
      selectable
      {...props}
      style={[
        {
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          color: colors.foreground,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
        },
        style,
      ]}
    >
      {children ?? api.value}
    </Text>
  )
}
export const Clipboard = {
  Root,
  RootProvider,
  Context,
  Label,
  Control,
  Input: ClipboardInput,
  Trigger,
  Indicator,
  ValueText,
}
