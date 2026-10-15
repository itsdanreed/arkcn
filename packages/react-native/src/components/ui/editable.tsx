/** Inline editing composed from the standard native Input. */
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { Platform, Pressable, Text, TextInput, View, type StyleProp, type TextStyle } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { Input, type InputRootProps } from "./input"
import { useFieldsetContext } from "./fieldset"

type EditableState = {
  value: string
  editing: boolean
  disabled: boolean
  readOnly: boolean
  placeholder: string
  label: string
  selectOnFocus: boolean
  submitMode: "enter" | "blur" | "both" | "none"
  activationMode: "press" | "none"
  setLabel: (label: string) => void
  setValue: (value: string) => void
  edit: () => void
  submit: () => void
  cancel: () => void
  blur: () => void
  actionPending: { current: boolean }
}
const [Provider, useEditableContext] = createRequiredContext<EditableState>("Editable")
export { useEditableContext }
export type EditableRootProps = ComponentPropsWithRef<typeof View> & {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string }) => void
  onValueCommit?: (details: { value: string }) => void
  onValueRevert?: (details: { value: string }) => void
  edit?: boolean
  defaultEdit?: boolean
  onEditChange?: (details: { edit: boolean }) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  selectOnFocus?: boolean
  submitMode?: EditableState["submitMode"]
  activationMode?: EditableState["activationMode"]
}
function EditableRoot({
  value,
  defaultValue = "",
  onValueChange,
  onValueCommit,
  onValueRevert,
  edit,
  defaultEdit = false,
  onEditChange,
  disabled = false,
  readOnly = false,
  placeholder = "",
  selectOnFocus = true,
  submitMode = "both",
  activationMode = "press",
  style,
  ...props
}: EditableRootProps) {
  const [text, updateText] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  const [editing, updateEditing] = useControllable(edit, defaultEdit, (edit) => onEditChange?.({ edit }))
  const [label, setLabel] = useState("")
  const parent = useFieldsetContext()
  const blocked = disabled || parent.disabled
  const active = editing && !blocked && !readOnly
  const snapshot = useRef(text)
  const previousActive = useRef(false)
  const current = useRef({ text, active })
  current.current = { text, active }
  const actionPending = useRef(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useLayoutEffect(() => {
    if (active && !previousActive.current) snapshot.current = text
    previousActive.current = active
  }, [active, text])
  useEffect(() => () => clearTimeout(blurTimer.current), [])
  const finish = (revert: boolean) => {
    clearTimeout(blurTimer.current)
    if (!current.current.active) return
    const next = revert ? snapshot.current : current.current.text
    current.current.active = false
    if (revert) updateText(next)
    updateEditing(false)
    if (revert) onValueRevert?.({ value: next })
    else onValueCommit?.({ value: next })
  }
  return (
    <Provider
      value={{
        value: text,
        editing: active,
        disabled: blocked,
        readOnly,
        placeholder,
        label,
        selectOnFocus,
        submitMode,
        activationMode,
        setLabel,
        setValue: (next) => {
          if (blocked || readOnly) return
          current.current.text = next
          updateText(next)
        },
        edit: () => {
          if (blocked || readOnly || current.current.active) return
          snapshot.current = current.current.text
          updateEditing(true)
        },
        submit: () => finish(false),
        cancel: () => finish(true),
        actionPending,
        blur: () => {
          if (submitMode !== "blur" && submitMode !== "both") return
          clearTimeout(blurTimer.current)
          // Let a Save/Cancel press take priority over the input's blur event.
          blurTimer.current = setTimeout(() => {
            if (!actionPending.current) finish(false)
          }, 0)
        },
      }}
    >
      <View {...props} style={[{ width: "100%", gap: 6 }, style]} />
    </Provider>
  )
}
export type EditableLabelProps = ComponentPropsWithRef<typeof Text>
function EditableLabel({ children, accessibilityLabel, style, ...props }: EditableLabelProps) {
  const { setLabel } = useEditableContext()
  const { colors, typography, fontSize } = useNativeTheme()
  const label =
    accessibilityLabel ?? (typeof children === "string" || typeof children === "number" ? String(children) : "")
  useLayoutEffect(() => {
    setLabel(label)
    return () => setLabel("")
  }, [label, setLabel])
  return (
    <Text
      {...props}
      accessibilityLabel={accessibilityLabel}
      style={[
        { ...typography.medium, fontSize: fontSize.md, lineHeight: fontSize.md, color: colors.foreground },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
export type EditableAreaProps = ComponentPropsWithRef<typeof View>
function EditableArea({ style, ...props }: EditableAreaProps) {
  return <View {...props} style={[{ position: "relative", width: "100%" }, style]} />
}
export type EditablePreviewProps = ComponentPropsWithRef<typeof Pressable> & { textStyle?: StyleProp<TextStyle> }
function EditablePreview({
  ref,
  children,
  style,
  textStyle,
  onPress,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: EditablePreviewProps) {
  const state = useEditableContext()
  const { colors, typography, fontSize, lineHeight, controlHeight, spacing, radius, opacity } = useNativeTheme()
  const { transition } = useMotion()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [focused, setFocused] = useState(false)
  const previewRef = useRef<ComponentRef<typeof View>>(null)
  const wasEditing = useRef(state.editing)
  useImperativeHandle(ref, () => previewRef.current as ComponentRef<typeof View>)
  useEffect(() => {
    if (wasEditing.current && !state.editing && Platform.OS === "web") previewRef.current?.focus()
    wasEditing.current = state.editing
  }, [state.editing])
  if (state.editing) return null
  const blocked = state.disabled || state.readOnly || props.disabled
  const content = typeof children === "function" ? children({ pressed }) : children
  return (
    <AnimatedPressable
      {...props}
      ref={previewRef}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? (state.label || "Edit value")}
      accessibilityValue={{ text: state.value || state.placeholder }}
      accessibilityHint={props.accessibilityHint ?? (state.readOnly ? "Read only" : "Activate to edit")}
      accessibilityState={{ ...props.accessibilityState, disabled: !!blocked }}
      disabled={blocked}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented && state.activationMode === "press") {
          // The preview unmounts before native Pressable can deliver press-out.
          setPressed(false)
          setHovered(false)
          setFocused(false)
          state.edit()
        }
      }}
      onHoverIn={(event) => {
        setHovered(true)
        onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        onHoverOut?.(event)
      }}
      onPressIn={(event) => {
        setPressed(true)
        props.onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        props.onPressOut?.(event)
      }}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        transition(["backgroundColor"]),
        {
          height: controlHeight.default,
          width: "100%",
          justifyContent: "center",
          paddingHorizontal: spacing.controlX,
          borderRadius: radius.lg,
          backgroundColor: !blocked && (hovered || pressed) ? colors.muted : "transparent",
          opacity: state.disabled ? opacity.disabled : 1,
          boxShadow: focused ? `0px 0px 0px 3px ${withOpacity(colors.ring, 0.5)}` : "none",
        },
        Platform.OS === "web" && { outlineWidth: 0 },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {content != null && typeof content !== "string" && typeof content !== "number" ? (
        content
      ) : (
        <Text
          style={[
            {
              ...typography.regular,
              fontSize: fontSize.md,
              lineHeight: lineHeight.md,
              color: state.value ? colors.foreground : colors.mutedForeground,
            },
            textStyle,
          ]}
        >
          {content ?? (state.value || state.placeholder)}
        </Text>
      )}
    </AnimatedPressable>
  )
}
export type EditableInputProps = Omit<InputRootProps, "value" | "defaultValue" | "editable">
function EditableInput({
  ref,
  onFocus,
  onChangeText,
  onBlur,
  onSubmitEditing,
  onKeyPress,
  ...props
}: EditableInputProps) {
  const state = useEditableContext()
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null)
  const selectionFrame = useRef<number | undefined>(undefined)
  useImperativeHandle(ref, () => inputRef.current as ComponentRef<typeof TextInput>)
  useEffect(
    () => () => {
      if (selectionFrame.current !== undefined) cancelAnimationFrame(selectionFrame.current)
    },
    []
  )
  if (!state.editing) return null
  return (
    <Input.Root
      autoFocus
      selectTextOnFocus={state.selectOnFocus}
      returnKeyType="done"
      {...props}
      ref={inputRef}
      value={state.value}
      onFocus={(event) => {
        onFocus?.(event)
        if (Platform.OS !== "web" && (props.selectTextOnFocus ?? state.selectOnFocus) && !event.defaultPrevented) {
          // UIKit's initial auto-focus can run before selectTextOnFocus is applied.
          selectionFrame.current = requestAnimationFrame(() => inputRef.current?.setSelection(0, state.value.length))
        }
      }}
      placeholder={props.placeholder ?? state.placeholder}
      accessibilityLabel={props.accessibilityLabel ?? (state.label || "Edit value")}
      onChangeText={(value) => {
        state.setValue(value)
        onChangeText?.(value)
      }}
      onBlur={(event) => {
        if (selectionFrame.current !== undefined) cancelAnimationFrame(selectionFrame.current)
        onBlur?.(event)
        if (!event.defaultPrevented) state.blur()
      }}
      submitBehavior={state.submitMode === "enter" || state.submitMode === "both" ? "blurAndSubmit" : "submit"}
      onSubmitEditing={(event) => {
        onSubmitEditing?.(event)
        if (!event.defaultPrevented && (state.submitMode === "enter" || state.submitMode === "both")) state.submit()
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (!event.defaultPrevented && event.nativeEvent.key === "Escape") {
          event.preventDefault()
          state.cancel()
        }
      }}
    />
  )
}
export type EditableControlProps = ComponentPropsWithRef<typeof View>
function EditableControl({ style, ...props }: EditableControlProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} />
}
function Trigger({
  action,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps & { action: "edit" | "submit" | "cancel" }) {
  const state = useEditableContext()
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(
    () => () => {
      clearTimeout(releaseTimer.current)
      state.actionPending.current = false
    },
    [state.actionPending]
  )
  if ((action === "edit") === state.editing) return null
  return (
    <Button
      variant="ghost"
      {...props}
      disabled={props.disabled || state.disabled || state.readOnly}
      accessibilityLabel={
        props.accessibilityLabel ?? (action === "edit" ? "Edit" : action === "submit" ? "Save" : "Cancel")
      }
      onPressIn={(event) => {
        state.actionPending.current = true
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        releaseTimer.current = setTimeout(() => {
          state.actionPending.current = false
        }, 0)
        onPressOut?.(event)
      }}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) state[action]()
        state.actionPending.current = false
      }}
    />
  )
}
export type EditableEditTriggerProps = ButtonProps
export type EditableSubmitTriggerProps = ButtonProps
export type EditableCancelTriggerProps = ButtonProps
function EditableEditTrigger(props: EditableEditTriggerProps) {
  return <Trigger {...props} action="edit" />
}
function EditableSubmitTrigger(props: EditableSubmitTriggerProps) {
  return <Trigger {...props} action="submit" />
}
function EditableCancelTrigger(props: EditableCancelTriggerProps) {
  return <Trigger {...props} action="cancel" />
}
export type EditableContextProps = { children: (context: EditableState) => ReactNode }
function EditableContext({ children }: EditableContextProps) {
  return children(useEditableContext())
}
export const Editable = {
  Root: EditableRoot,
  Label: EditableLabel,
  Area: EditableArea,
  Preview: EditablePreview,
  Input: EditableInput,
  Control: EditableControl,
  EditTrigger: EditableEditTrigger,
  SubmitTrigger: EditableSubmitTrigger,
  CancelTrigger: EditableCancelTrigger,
  Context: EditableContext,
}
