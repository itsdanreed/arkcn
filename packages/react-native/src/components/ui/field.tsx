/** Native field composition with shared input styles, label focus, and validation. */
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
  type RefObject,
} from "react"
import { Text, TextInput, View } from "react-native"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"
import { Input, type InputRootProps } from "./input"
import { Label } from "./label"
import { Separator } from "./separator"
import { Fieldset, useFieldsetContext } from "./fieldset"

const [Provider, useFieldContext] = createRequiredContext<{
  disabled: boolean
  invalid: boolean
  required: boolean
  readOnly: boolean
  horizontal: boolean
  id: string
  label: string
  description: string
  error: string
  setLabel: (value: string) => void
  setDescription: (value: string) => void
  setError: (value: string) => void
  input: RefObject<ComponentRef<typeof TextInput> | null>
}>("Field")
export { useFieldContext }
function textContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textContent(child.props.children)
          : ""
    )
    .join("")
}
export type FieldRootProps = ComponentPropsWithRef<typeof View> & {
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  readOnly?: boolean
  orientation?: "vertical" | "horizontal" | "responsive"
}
function FieldRoot({
  disabled = false,
  invalid = false,
  required = false,
  readOnly = false,
  orientation = "vertical",
  style,
  onLayout,
  ...props
}: FieldRootProps) {
  const parent = useFieldsetContext()
  const id = useId()
  const input = useRef<ComponentRef<typeof TextInput> | null>(null)
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [width, setWidth] = useState(0)
  const horizontal = orientation === "horizontal" || (orientation === "responsive" && width >= 448)
  return (
    <Provider
      value={{
        disabled: disabled || parent.disabled,
        invalid,
        required,
        readOnly,
        horizontal,
        id,
        label,
        description,
        error,
        setLabel,
        setDescription,
        setError,
        input,
      }}
    >
      <View
        {...props}
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width)
          onLayout?.(event)
        }}
        style={[
          {
            width: "100%",
            gap: 8,
            flexDirection: horizontal ? "row" : "column",
            ...(horizontal && { alignItems: "center" }),
          },
          style,
        ]}
      />
    </Provider>
  )
}
export type FieldLabelProps = ComponentPropsWithRef<typeof Text>
function FieldLabel({ children, style, ...props }: FieldLabelProps) {
  const field = useFieldContext()
  const { colors } = useNativeTheme()
  const { setLabel } = field
  const label = textContent(children)
  useLayoutEffect(() => {
    setLabel(label)
    return () => setLabel("")
  }, [setLabel, label])
  return (
    <Label.Root
      nativeID={`${field.id}-label`}
      disabled={field.disabled}
      controlRef={field.input}
      {...props}
      style={[{ lineHeight: 19.25, ...(field.invalid && { color: colors.destructive }) }, style]}
    >
      {children}
    </Label.Root>
  )
}
export type FieldInputProps = InputRootProps
function FieldInput({
  ref,
  disabled,
  invalid,
  editable,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...props
}: FieldInputProps) {
  const field = useFieldContext()
  const { colors } = useNativeTheme()
  return (
    <Input.Root
      {...props}
      ref={(value) => {
        field.input.current = value
        if (typeof ref === "function") return ref(value)
        if (ref) ref.current = value
      }}
      disabled={disabled || field.disabled}
      invalid={invalid ?? field.invalid}
      editable={!field.readOnly && editable !== false}
      accessibilityLabel={accessibilityLabel ?? field.label}
      accessibilityLabelledBy={`${field.id}-label`}
      style={[field.horizontal && { flex: 1, minWidth: 0 }, field.invalid && { color: colors.destructive }, style]}
      accessibilityHint={
        accessibilityHint ??
        [field.required && "Required", field.invalid && field.error, field.description].filter(Boolean).join(". ")
      }
    />
  )
}
export type FieldTextareaProps = InputRootProps
function FieldTextarea({ style, ...props }: FieldTextareaProps) {
  const { textareaHeight, spacing } = useNativeTheme()
  return (
    <FieldInput
      {...props}
      multiline
      style={[{ minHeight: textareaHeight, textAlignVertical: "top", paddingVertical: spacing.sm }, style]}
    />
  )
}
export type FieldHelperTextProps = ComponentPropsWithRef<typeof Text>
function FieldHelperText({ children, style, ...props }: FieldHelperTextProps) {
  const field = useFieldContext()
  const { colors, typography, fontSize } = useNativeTheme()
  const { setDescription } = field
  const description = textContent(children)
  useLayoutEffect(() => {
    setDescription(description)
    return () => setDescription("")
  }, [setDescription, description])
  return (
    <Text
      {...props}
      style={[{ ...typography.regular, fontSize: fontSize.md, lineHeight: 21, color: colors.mutedForeground }, style]}
    >
      {children}
    </Text>
  )
}
export type FieldErrorTextProps = ComponentPropsWithRef<typeof Text> & {
  errors?: Array<{ message?: string } | undefined>
}
function FieldErrorText({ children, errors, style, ...props }: FieldErrorTextProps) {
  const field = useFieldContext()
  const { typography, fontSize, lineHeight, colors } = useNativeTheme()
  const messages = [...new Set(errors?.map((error) => error?.message).filter(Boolean))]
  const content = children ?? messages.join("\n")
  const { setError } = field
  const error = field.invalid ? textContent(content) : ""
  useLayoutEffect(() => {
    setError(error)
    return () => setError("")
  }, [setError, error])
  if (!field.invalid || !content) return null
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      {...props}
      style={[
        { ...typography.regular, fontSize: fontSize.md, lineHeight: lineHeight.md, color: colors.destructive },
        style,
      ]}
    >
      {content}
    </Text>
  )
}
export type FieldRequiredIndicatorProps = ComponentPropsWithRef<typeof Text> & { fallback?: ReactNode }
function FieldRequiredIndicator({ children = "\u00a0*", fallback = null, ...props }: FieldRequiredIndicatorProps) {
  const { required } = useFieldContext()
  return required ? (
    <Text accessibilityElementsHidden importantForAccessibility="no" {...props}>
      {children}
    </Text>
  ) : (
    fallback
  )
}
export type FieldGroupProps = ComponentPropsWithRef<typeof View>
function FieldGroup({ style, ...props }: FieldGroupProps) {
  return <View {...props} style={[{ width: "100%", gap: 20 }, style]} />
}
export type FieldContentProps = ComponentPropsWithRef<typeof View>
function FieldContent({ style, ...props }: FieldContentProps) {
  return <View {...props} style={[{ flex: 1, gap: 2 }, style]} />
}
export type FieldTitleProps = ComponentPropsWithRef<typeof Text>
function FieldTitle({ style, ...props }: FieldTitleProps) {
  const { disabled } = useFieldContext()
  const { typography, colors, fontSize, lineHeight, opacity } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.medium,
          fontSize: fontSize.md,
          lineHeight: lineHeight.md,
          color: colors.foreground,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    />
  )
}
export type FieldLegendProps = ComponentPropsWithRef<typeof Fieldset.Legend> & { variant?: "legend" | "label" }
function FieldLegend({ variant = "legend", style, ...props }: FieldLegendProps) {
  return <Fieldset.Legend {...props} style={[variant === "label" && { fontSize: 14, lineHeight: 20 }, style]} />
}
export type FieldSeparatorProps = ComponentPropsWithRef<typeof View>
function FieldSeparator({ children, style, ...props }: FieldSeparatorProps) {
  const { colors, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <View
      {...props}
      style={[{ height: 20, marginVertical: -8, justifyContent: "center", alignItems: "center" }, style]}
    >
      <Separator.Root style={{ position: "absolute", width: "100%" }} />
      {children != null && (
        <Text
          style={{
            ...typography.regular,
            fontSize: fontSize.md,
            lineHeight: lineHeight.md,
            backgroundColor: colors.background,
            color: colors.mutedForeground,
            paddingHorizontal: 8,
          }}
        >
          {children}
        </Text>
      )}
    </View>
  )
}
export type FieldSetProps = ComponentPropsWithRef<typeof Fieldset.Root>
export type FieldContextProps = { children: (state: ReturnType<typeof useFieldContext>) => ReactNode }
function FieldContext({ children }: FieldContextProps) {
  return children(useFieldContext())
}
export const Field = {
  Root: FieldRoot,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Label: FieldLabel,
  HelperText: FieldHelperText,
  ErrorText: FieldErrorText,
  RequiredIndicator: FieldRequiredIndicator,
  Group: FieldGroup,
  Content: FieldContent,
  Title: FieldTitle,
  Set: Fieldset.Root,
  Legend: FieldLegend,
  Separator: FieldSeparator,
  Context: FieldContext,
}
