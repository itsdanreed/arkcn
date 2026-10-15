import { useEffect, useRef, useState, type ComponentPropsWithRef, type ComponentRef, type ReactNode } from "react"
import { Platform, Text, TextInput, View } from "react-native"
import { XIcon } from "lucide-react-native"
import { createRequiredContext } from "../../lib/context"
import { useControllable } from "../../lib/controllable"
import { AnimatedTextInput, AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { Label, type LabelRootProps } from "./label"
import { useFieldsetContext } from "./fieldset"

export type UseTagsInputProps = {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: { value: string[] }) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (details: { inputValue: string }) => void
  onValueInvalid?: (details: { value: string; reason: "duplicate" | "max" | "validate" }) => void
  validate?: (details: { inputValue: string; value: string[] }) => boolean
  sanitizeValue?: (value: string) => string
  allowDuplicates?: boolean
  max?: number
  delimiter?: string
  addOnPaste?: boolean
  blurBehavior?: "add" | "clear"
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  editable?: boolean
}
export function useTagsInput({
  value: controlled,
  defaultValue = [],
  onValueChange,
  inputValue: controlledInput,
  defaultInputValue = "",
  onInputValueChange,
  onValueInvalid,
  validate,
  sanitizeValue = (value) => value.trim(),
  allowDuplicates = false,
  max = Infinity,
  delimiter = ",",
  addOnPaste = false,
  blurBehavior,
  disabled = false,
  readOnly = false,
  invalid = false,
  editable = true,
}: UseTagsInputProps = {}) {
  const [value, update] = useControllable(controlled, defaultValue, (value) => onValueChange?.({ value }))
  const [draft, setDraft] = useState(defaultInputValue)
  const inputValue = controlledInput ?? draft
  // Native change and submit events can arrive before React renders the draft.
  // Track writes immediately so a following clear is never mistaken for a no-op.
  const draftRef = useRef(inputValue)
  draftRef.current = inputValue
  const updateInput = (next: string) => {
    if (draftRef.current === next) return
    draftRef.current = next
    if (controlledInput === undefined) setDraft(next)
    onInputValueChange?.({ inputValue: next })
  }
  const [focused, setFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [editing, setEditing] = useState<{ index: number; original: string; draft: string } | null>(null)
  const [label, setLabel] = useState("")
  const input = useRef<ComponentRef<typeof TextInput> | null>(null)
  const blocked = disabled || readOnly
  const valid = (candidate: string, values: string[], replacing = false) => {
    const reason =
      !allowDuplicates && values.includes(candidate)
        ? "duplicate"
        : !replacing && values.length >= max
          ? "max"
          : validate && !validate({ inputValue: candidate, value: values })
            ? "validate"
            : null
    if (reason) onValueInvalid?.({ value: candidate, reason })
    return !reason
  }
  const add = (candidates: string[]) => {
    if (blocked) return { added: false, rejected: candidates }
    const rejected: string[] = []
    const next = [...value]
    for (const raw of candidates) {
      const candidate = sanitizeValue(raw)
      if (!candidate) continue
      if (valid(candidate, next)) next.push(candidate)
      else rejected.push(candidate)
    }
    if (next.length === value.length) return { added: false, rejected }
    update(next)
    setHighlightedIndex(-1)
    return { added: true, rejected }
  }
  const remove = (index: number) => {
    if (blocked || index < 0 || index >= value.length) return
    update(value.filter((_, i) => i !== index))
    setHighlightedIndex(-1)
    setEditing(null)
  }
  const commit = (text = draftRef.current) => {
    if (blocked) return
    if (add([text]).added || !text.trim()) updateInput("")
  }
  return {
    value,
    inputValue,
    disabled,
    readOnly,
    invalid,
    editable,
    focused,
    label,
    input,
    highlightedIndex,
    editing: blocked ? null : editing,
    setFocused,
    setLabel,
    focus: () => {
      if (!disabled) input.current?.focus()
    },
    setInputValue: (text: string) => {
      if (!blocked) updateInput(text)
    },
    setValue: (next: string[]) => {
      if (!blocked) {
        update(next)
        setEditing(null)
        setHighlightedIndex(-1)
      }
    },
    addValue: (tag: string) => add([tag]).added,
    removeValue: (tag: string) => remove(value.indexOf(tag)),
    remove,
    commit,
    clearValue: () => {
      if (!blocked) {
        update([])
        updateInput("")
        setHighlightedIndex(-1)
        setEditing(null)
      }
    },
    change: (text: string) => {
      if (blocked) return
      setHighlightedIndex(-1)
      if (
        delimiter &&
        text.includes(delimiter) &&
        (text.endsWith(delimiter) || (addOnPaste && text.length - draftRef.current.length > 1))
      ) {
        const parts = text.split(delimiter)
        const tail = addOnPaste && text.length - draftRef.current.length > 1 ? "" : (parts.pop() ?? "")
        const result = add(parts)
        updateInput([...result.rejected, tail].filter(Boolean).join(delimiter))
      } else updateInput(text)
    },
    blur: () => {
      setFocused(false)
      if (blocked) return
      if (blurBehavior === "add") commit()
      else if (blurBehavior === "clear") updateInput("")
    },
    backspace: () => {
      if (blocked || draftRef.current) return
      if (highlightedIndex >= 0) remove(highlightedIndex)
      else setHighlightedIndex(value.length - 1)
    },
    highlight: (index: number) => {
      if (!blocked) setHighlightedIndex(index)
    },
    edit: (index: number) => {
      if (!blocked && editable && value[index] !== undefined) {
        setEditing({ index, original: value[index], draft: value[index] })
        setHighlightedIndex(-1)
      }
    },
    changeEdit: (draft: string) => {
      if (!blocked) setEditing((previous) => previous && { ...previous, draft })
    },
    cancelEdit: () => setEditing(null),
    commitEdit: (text?: string) => {
      if (blocked || !editing) return
      const { index, original, draft } = editing
      if (value[index] !== original) {
        setEditing(null)
        return
      }
      const candidate = sanitizeValue(text ?? draft)
      if (!candidate) remove(index)
      else if (
        candidate === original ||
        valid(
          candidate,
          value.filter((_, i) => i !== index),
          true
        )
      ) {
        if (candidate !== original) update(value.map((tag, i) => (i === index ? candidate : tag)))
        setEditing(null)
      }
    },
  }
}
export type UseTagsInputReturn = ReturnType<typeof useTagsInput>
const [Provider, useTagsInputContext] = createRequiredContext<UseTagsInputReturn>("TagsInput")
const [ItemProvider, useTagsInputItemContext] = createRequiredContext<{ index: number; value: string }>(
  "TagsInput.Item"
)
export { useTagsInputContext, useTagsInputItemContext }
export type TagsInputRootProps = ComponentPropsWithRef<typeof View> & UseTagsInputProps
function TagsInputRoot({
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  onValueInvalid,
  validate,
  sanitizeValue,
  allowDuplicates,
  max,
  delimiter,
  addOnPaste,
  blurBehavior,
  disabled,
  readOnly,
  invalid,
  editable,
  ...props
}: TagsInputRootProps) {
  const fieldset = useFieldsetContext()
  const api = useTagsInput({
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    onValueInvalid,
    validate,
    sanitizeValue,
    allowDuplicates,
    max,
    delimiter,
    addOnPaste,
    blurBehavior,
    disabled: disabled || fieldset.disabled,
    readOnly,
    invalid,
    editable,
  })
  return <TagsInputRootProvider {...props} value={api} />
}
export type TagsInputRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UseTagsInputReturn }
function TagsInputRootProvider({ value, style, ...props }: TagsInputRootProviderProps) {
  return (
    <Provider value={value}>
      <View {...props} style={[{ width: "100%", gap: 6 }, style]} />
    </Provider>
  )
}
function TagsInputContext({ children }: { children: (api: UseTagsInputReturn) => ReactNode }) {
  return children(useTagsInputContext())
}
function TagsInputLabel({ children, ...props }: LabelRootProps) {
  const api = useTagsInputContext()
  const { setLabel } = api
  useEffect(() => {
    if (typeof children === "string") setLabel(children)
  }, [children, setLabel])
  return (
    <Label.Root accessibilityRole="button" disabled={api.disabled} controlRef={api.input} {...props}>
      {children}
    </Label.Root>
  )
}
function TagsInputControl({ style, children, ...props }: ComponentPropsWithRef<typeof View>) {
  const api = useTagsInputContext()
  const { colors, colorScheme, radius } = useNativeTheme()
  const { transition } = useMotion()
  const ring = api.invalid || api.focused
  return (
    <AnimatedView
      {...props}
      style={[
        transition(["backgroundColor", "borderColor"]),
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          minHeight: 32,
          paddingHorizontal: api.value.length ? 4 : 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderRadius: radius.lg,
          borderColor: api.invalid
            ? withOpacity(colors.destructive, colorScheme === "dark" ? 0.5 : 1)
            : api.focused
              ? colors.ring
              : colors.input,
          backgroundColor: "transparent",
          boxShadow: ring
            ? `0px 0px 0px 3px ${withOpacity(api.invalid ? colors.destructive : colors.ring, api.invalid ? (colorScheme === "dark" ? 0.4 : 0.2) : 0.5)}`
            : "none",
          opacity: api.disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <AnimatedView
        pointerEvents="none"
        style={[
          transition("backgroundColor"),
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            borderRadius: radius.lg - 1,
            backgroundColor: api.disabled
              ? withOpacity(colors.input, colorScheme === "dark" ? 0.8 : 0.5)
              : colorScheme === "dark"
                ? withOpacity(colors.input, 0.3)
                : "transparent",
          },
        ]}
      />
      {children}
    </AnimatedView>
  )
}
export type TagsInputInputProps = Omit<ComponentPropsWithRef<typeof TextInput>, "value" | "defaultValue">
function TagsInputInput({
  style,
  ref,
  onChangeText,
  onFocus,
  onBlur,
  onKeyPress,
  onSubmitEditing,
  ...props
}: TagsInputInputProps) {
  const api = useTagsInputContext()
  const { colors, typography } = useNativeTheme()
  return (
    <TextInput
      underlineColorAndroid="transparent"
      placeholderTextColor={colors.mutedForeground}
      accessibilityLabel={api.label || "Tags"}
      returnKeyType="done"
      submitBehavior="submit"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      ref={(node) => {
        api.input.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      editable={!api.disabled && !api.readOnly && props.editable !== false}
      accessibilityState={{ ...props.accessibilityState, disabled: api.disabled }}
      aria-invalid={api.invalid}
      value={api.inputValue}
      onChangeText={(text) => {
        api.change(text)
        onChangeText?.(text)
      }}
      onFocus={(event) => {
        api.setFocused(true)
        api.highlight(-1)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        api.blur()
        onBlur?.(event)
      }}
      onSubmitEditing={(event) => {
        api.commit(event.nativeEvent.text)
        onSubmitEditing?.(event)
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (!event.defaultPrevented && event.nativeEvent.key === "Backspace") api.backspace()
      }}
      style={[
        {
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 64,
          padding: 0,
          height: 20,
          ...typography.regular,
          fontSize: 14,
          lineHeight: 20,
          color: colors.foreground,
          includeFontPadding: false,
        },
        Platform.OS === "web" && { outlineWidth: 0 },
        style,
      ]}
    />
  )
}
export type TagsInputItemProps = ComponentPropsWithRef<typeof View> & { index: number; value: string }
function TagsInputItem({ index, value, style, ...props }: TagsInputItemProps) {
  return (
    <ItemProvider value={{ index, value }}>
      <View {...props} style={[{ flexDirection: "row", maxWidth: "100%" }, style]} />
    </ItemProvider>
  )
}
function TagsInputItemPreview({ style, ...props }: ComponentPropsWithRef<typeof View>) {
  const api = useTagsInputContext()
  const item = useTagsInputItemContext()
  const { colors, radius } = useNativeTheme()
  if (api.editing?.index === item.index) return null
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: "row",
          flexShrink: 1,
          alignItems: "center",
          gap: 4,
          height: 21,
          paddingLeft: 6,
          borderRadius: radius.sm,
          backgroundColor: colors.muted,
          boxShadow: api.highlightedIndex === item.index ? `0px 0px 0px 2px ${withOpacity(colors.ring, 0.5)}` : "none",
        },
        style,
      ]}
    />
  )
}
function TagsInputItemText({ style, onPress, onLongPress, children, ...props }: ComponentPropsWithRef<typeof Text>) {
  const api = useTagsInputContext()
  const item = useTagsInputItemContext()
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      {...props}
      numberOfLines={1}
      accessibilityRole="button"
      disabled={api.disabled || api.readOnly}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: api.disabled || api.readOnly,
        selected: api.highlightedIndex === item.index,
      }}
      accessibilityHint={api.editable && !api.disabled && !api.readOnly ? "Hold to edit tag" : undefined}
      onPress={(event) => {
        api.highlight(item.index)
        onPress?.(event)
      }}
      onLongPress={(event) => {
        api.edit(item.index)
        onLongPress?.(event)
      }}
      style={[{ ...typography.medium, fontSize: 12, lineHeight: 16, color: colors.foreground, flexShrink: 1 }, style]}
    >
      {children ?? item.value}
    </Text>
  )
}
function TagsInputItemDeleteTrigger({ children, ...props }: ButtonProps) {
  const api = useTagsInputContext()
  const item = useTagsInputItemContext()
  const { colors } = useNativeTheme()
  const [hovered, setHovered] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      accessibilityLabel={`Remove ${item.value}`}
      {...props}
      disabled={api.disabled || api.readOnly || props.disabled}
      hitSlop={2}
      onHoverIn={(event) => {
        setHovered(true)
        props.onHoverIn?.(event)
      }}
      onHoverOut={(event) => {
        setHovered(false)
        props.onHoverOut?.(event)
      }}
      onPress={(event) => {
        props.onPress?.(event)
        if (!event.defaultPrevented) api.remove(item.index)
      }}
      style={(state) => [
        { marginLeft: -4, opacity: hovered || state.pressed ? 1 : 0.5 },
        typeof props.style === "function" ? props.style(state) : props.style,
      ]}
    >
      {children ?? <XIcon size={14} color={colors.foreground} />}
    </Button>
  )
}
function TagsInputItemInput({
  style,
  onBlur,
  onKeyPress,
  onSubmitEditing,
  onChangeText,
  ...props
}: TagsInputInputProps) {
  const api = useTagsInputContext()
  const item = useTagsInputItemContext()
  const { colors, typography, radius } = useNativeTheme()
  if (api.editing?.index !== item.index) return null
  return (
    <AnimatedTextInput
      autoFocus
      selectTextOnFocus
      underlineColorAndroid="transparent"
      accessibilityLabel={`Edit ${item.value}`}
      returnKeyType="done"
      {...props}
      value={api.editing.draft}
      onChangeText={(text) => {
        api.changeEdit(text)
        onChangeText?.(text)
      }}
      onBlur={(event) => {
        api.commitEdit()
        onBlur?.(event)
      }}
      onSubmitEditing={(event) => {
        api.commitEdit(event.nativeEvent.text)
        onSubmitEditing?.(event)
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (!event.defaultPrevented && event.nativeEvent.key === "Escape") api.cancelEdit()
      }}
      style={[
        {
          height: 21,
          minWidth: 64,
          paddingHorizontal: 6,
          paddingVertical: 0,
          borderRadius: radius.sm,
          backgroundColor: colors.muted,
          color: colors.foreground,
          ...typography.regular,
          fontSize: 12,
          lineHeight: 16,
          boxShadow: `0px 0px 0px 2px ${withOpacity(colors.ring, 0.5)}`,
          includeFontPadding: false,
        },
        Platform.OS === "web" && { outlineWidth: 0 },
        style,
      ]}
    />
  )
}
function TagsInputClearTrigger({ children, ...props }: ButtonProps) {
  const api = useTagsInputContext()
  const { colors } = useNativeTheme()
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      accessibilityLabel="Clear tags"
      {...props}
      disabled={api.disabled || api.readOnly || props.disabled}
      onPress={(event) => {
        props.onPress?.(event)
        if (!event.defaultPrevented) api.clearValue()
      }}
    >
      {children ?? <XIcon size={16} color={colors.mutedForeground} />}
    </Button>
  )
}
export const TagsInput = {
  Root: TagsInputRoot,
  RootProvider: TagsInputRootProvider,
  Context: TagsInputContext,
  Label: TagsInputLabel,
  Control: TagsInputControl,
  Input: TagsInputInput,
  Item: TagsInputItem,
  ItemPreview: TagsInputItemPreview,
  ItemText: TagsInputItemText,
  ItemDeleteTrigger: TagsInputItemDeleteTrigger,
  ItemInput: TagsInputItemInput,
  ClearTrigger: TagsInputClearTrigger,
}
