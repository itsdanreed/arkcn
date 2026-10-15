import { Children, useId, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native"
import { Check } from "lucide-react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { isFocusVisible } from "../../lib/focus"
import { AnimatedPressable, AnimatedText, AnimatedView, useMotion, useShadowTransition } from "../../lib/motion"
import { usePanelPresence } from "../../lib/presence"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"

export type UseStepsProps = {
  count?: number
  step?: number
  defaultStep?: number
  onStepChange?: (details: { step: number }) => void
  onStepComplete?: () => void
  onStepInvalid?: (details: { step: number; action: "next" | "set"; targetStep?: number }) => void
  isStepValid?: (index: number) => boolean
  isStepSkippable?: (index: number) => boolean
  linear?: boolean
  orientation?: "horizontal" | "vertical"
  lazyMount?: boolean
  unmountOnExit?: boolean
}
export function useSteps({
  count = 1,
  step,
  defaultStep = 0,
  onStepChange,
  onStepComplete,
  onStepInvalid,
  isStepValid = () => true,
  isStepSkippable = () => false,
  linear = false,
  orientation = "horizontal",
  lazyMount = false,
  unmountOnExit = false,
}: UseStepsProps = {}) {
  const id = useId()
  const [value, updateStep] = useControllable(step, defaultStep, (step) => {
    onStepChange?.({ step })
    if (step === count) onStepComplete?.()
  })
  if (!Number.isInteger(count) || count < 1) throw new RangeError("Steps count must be a positive integer")
  if (!Number.isInteger(value) || value < 0 || value > count)
    throw new RangeError("Steps step must be between 0 and count")
  function move(target: number, action: "next" | "set") {
    if (!Number.isInteger(target) || target < 0 || target > count || target === value) return
    if (target > value && !isStepSkippable(value) && !isStepValid(value)) {
      onStepInvalid?.({ step: value, action, targetStep: action === "set" ? target : undefined })
      return
    }
    updateStep(target)
  }
  return {
    id,
    value,
    count,
    linear,
    orientation,
    lazyMount,
    unmountOnExit,
    percent: (value / count) * 100,
    hasNextStep: value < count,
    hasPrevStep: value > 0,
    isCompleted: value === count,
    isStepValid,
    isStepSkippable,
    setStep: (step: number) => move(step, "set"),
    goToNextStep: () => move(Math.min(count, value + 1), "next"),
    goToPrevStep: () => updateStep(Math.max(0, value - 1)),
    resetStep: () => updateStep(0),
    getItemState: ({ index }: { index: number }) => ({
      index,
      current: index === value,
      completed: index < value,
      incomplete: index > value,
      first: index === 0,
      last: index === count - 1,
      skippable: isStepSkippable(index),
      isValid: () => isStepValid(index),
      triggerId: `${id}-trigger-${index}`,
      contentId: `${id}-content-${index}`,
    }),
  }
}
export type UseStepsReturn = ReturnType<typeof useSteps>
const [Provider, useStepsContext] = createRequiredContext<UseStepsReturn>("Steps")
const [ItemProvider, useStepsItemContext] =
  createRequiredContext<ReturnType<UseStepsReturn["getItemState"]>>("Steps.Item")
export { useStepsContext, useStepsItemContext }
export type StepsRootProviderProps = ComponentPropsWithRef<typeof View> & { value: UseStepsReturn }
function StepsRootProvider({ value, style, ...props }: StepsRootProviderProps) {
  return (
    <Provider value={value}>
      <View
        {...props}
        style={[{ width: "100%", flexDirection: value.orientation === "vertical" ? "row" : "column", gap: 16 }, style]}
      />
    </Provider>
  )
}
export type StepsRootProps = ComponentPropsWithRef<typeof View> & UseStepsProps
function StepsRoot({
  count,
  step,
  defaultStep,
  onStepChange,
  onStepComplete,
  onStepInvalid,
  isStepValid,
  isStepSkippable,
  linear,
  orientation,
  lazyMount,
  unmountOnExit,
  ...props
}: StepsRootProps) {
  const value = useSteps({
    count,
    step,
    defaultStep,
    onStepChange,
    onStepComplete,
    onStepInvalid,
    isStepValid,
    isStepSkippable,
    linear,
    orientation,
    lazyMount,
    unmountOnExit,
  })
  return <StepsRootProvider {...props} value={value} />
}
export type StepsContextProps = { children: (value: UseStepsReturn) => ReactNode }
function StepsContext({ children }: StepsContextProps) {
  return children(useStepsContext())
}
export type StepsItemContextProps = { children: (value: ReturnType<typeof useStepsItemContext>) => ReactNode }
function StepsItemContext({ children }: StepsItemContextProps) {
  return children(useStepsItemContext())
}
export type StepsListProps = ComponentPropsWithRef<typeof View>
function StepsList({ style, ...props }: StepsListProps) {
  const vertical = useStepsContext().orientation === "vertical"
  return (
    <View
      accessibilityRole="tablist"
      {...props}
      style={[
        { flexDirection: vertical ? "column" : "row", alignItems: vertical ? "stretch" : "center", gap: 8 },
        style,
      ]}
    />
  )
}
export type StepsItemProps = ComponentPropsWithRef<typeof View> & { index: number }
function StepsItem({ index, style, ...props }: StepsItemProps) {
  const steps = useStepsContext()
  const item = steps.getItemState({ index })
  const vertical = steps.orientation === "vertical"
  return (
    <ItemProvider value={item}>
      <View
        {...props}
        style={[
          {
            flexGrow: item.last ? 0 : 1,
            flexBasis: item.last ? "auto" : 0,
            flexDirection: vertical ? "column" : "row",
            alignItems: vertical ? "flex-start" : "center",
            gap: 8,
          },
          style,
        ]}
      />
    </ItemProvider>
  )
}
export type StepsTriggerProps = ComponentPropsWithRef<typeof Pressable> & { textStyle?: StyleProp<TextStyle> }
function StepsTrigger({
  style,
  textStyle,
  children,
  disabled,
  onPress,
  onFocus,
  onBlur,
  onPressIn,
  onPressOut,
  accessibilityState,
  ...props
}: StepsTriggerProps) {
  const steps = useStepsContext()
  const item = useStepsItemContext()
  const { colors, radius, typography } = useNativeTheme()
  const { transition } = useMotion()
  const [focused, setFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const resolved = StyleSheet.flatten(typeof style === "function" ? style({ pressed }) : style)
  const shadow = useShadowTransition(
    resolved?.boxShadow ?? [
      { offsetX: 0, offsetY: 0, spreadDistance: focused ? 3 : 0, color: withOpacity(colors.ring, focused ? 0.5 : 0) },
    ]
  )
  return (
    <AnimatedPressable
      accessible
      accessibilityRole="tab"
      hitSlop={{ top: 8, bottom: 8 }}
      nativeID={item.triggerId}
      {...props}
      disabled={disabled}
      aria-selected={item.current}
      accessibilityState={{ ...accessibilityState, selected: item.current, disabled: !!disabled }}
      onPress={(event) => {
        if (disabled) return
        onPress?.(event)
        if (!event.defaultPrevented && !steps.linear) steps.setStep(item.index)
      }}
      onFocus={(event) => {
        setFocused(isFocusVisible(event))
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      onPressIn={(event) => {
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        onPressOut?.(event)
      }}
      style={[
        { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: radius.md, opacity: disabled ? 0.5 : 1 },
        resolved,
        shadow,
      ]}
    >
      {(state) =>
        Children.map(typeof children === "function" ? children(state) : children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <AnimatedText
              style={[
                transition("all"),
                {
                  ...typography.medium,
                  fontSize: 14,
                  lineHeight: 20,
                  color: item.incomplete ? colors.mutedForeground : colors.foreground,
                },
                textStyle,
              ]}
            >
              {child}
            </AnimatedText>
          ) : (
            child
          )
        )
      }
    </AnimatedPressable>
  )
}
export type StepsIndicatorProps = ComponentPropsWithRef<typeof View> & { textStyle?: StyleProp<TextStyle> }
function StepsIndicator({ style, textStyle, children, ...props }: StepsIndicatorProps) {
  const item = useStepsItemContext()
  const { colors, typography } = useNativeTheme()
  const { transition } = useMotion()
  const color = item.incomplete ? colors.mutedForeground : colors.primaryForeground
  return (
    <AnimatedView
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        transition(["backgroundColor", "borderColor"]),
        {
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: item.incomplete ? colors.input : colors.primary,
          backgroundColor: item.incomplete ? "transparent" : colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {Children.map(
        children ?? (item.completed ? <Check key="complete" size={14} color={color} /> : item.index + 1),
        (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <AnimatedText
              style={[
                transition("all"),
                { ...typography.medium, fontSize: 12, lineHeight: 16, fontVariant: ["tabular-nums"], color },
                textStyle,
              ]}
            >
              {child}
            </AnimatedText>
          ) : (
            child
          )
      )}
    </AnimatedView>
  )
}
export type StepsSeparatorProps = ComponentPropsWithRef<typeof View>
function StepsSeparator({ style, ...props }: StepsSeparatorProps) {
  const vertical = useStepsContext().orientation === "vertical"
  const item = useStepsItemContext()
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  if (item.last) return null
  return (
    <AnimatedView
      {...props}
      accessible={false}
      style={[
        transition(["backgroundColor"]),
        { backgroundColor: item.completed ? colors.primary : colors.border },
        vertical ? { marginStart: 14, height: 24, width: 1 } : { height: 1, flex: 1 },
        style,
      ]}
    />
  )
}
type PanelProps = ComponentPropsWithRef<typeof View> & { textStyle?: StyleProp<TextStyle> }
function Panel({ active, style, textStyle, children, ...props }: PanelProps & { active: boolean }) {
  const steps = useStepsContext()
  const mounted = usePanelPresence(active, steps.lazyMount, steps.unmountOnExit)
  const { colors, typography } = useNativeTheme()
  if (!mounted) return null
  return (
    <View
      {...props}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
      style={[{ flexShrink: 1 }, style, !active && { display: "none" }]}
    >
      {Children.map(
        Children.toArray(children).every((child) => typeof child === "string" || typeof child === "number")
          ? [Children.toArray(children).join("")]
          : children,
        (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <Text
              style={[{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }, textStyle]}
            >
              {child}
            </Text>
          ) : (
            child
          )
      )}
    </View>
  )
}
export type StepsContentProps = PanelProps & { index: number }
function StepsContent({ index, ...props }: StepsContentProps) {
  const steps = useStepsContext()
  return <Panel nativeID={`${steps.id}-content-${index}`} {...props} active={steps.value === index} />
}
export type StepsCompletedContentProps = PanelProps
function StepsCompletedContent(props: StepsCompletedContentProps) {
  return <Panel {...props} active={useStepsContext().isCompleted} />
}
export type StepsProgressProps = ComponentPropsWithRef<typeof View>
function StepsProgress({ style, children, ...props }: StepsProgressProps) {
  const { percent } = useStepsContext()
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      {...props}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: `${Math.round(percent)}% complete` }}
      style={[
        { width: "100%", height: 4, borderRadius: 9999, overflow: "hidden", backgroundColor: colors.muted },
        style,
      ]}
    >
      {children ?? (
        <AnimatedView
          style={[
            transition(["width", "backgroundColor"]),
            { height: "100%", width: `${percent}%`, backgroundColor: colors.primary },
          ]}
        />
      )}
    </View>
  )
}
export type StepsPrevTriggerProps = ButtonProps
function StepsPrevTrigger({ disabled, onPress, ...props }: StepsPrevTriggerProps) {
  const steps = useStepsContext()
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      disabled={disabled || !steps.hasPrevStep}
      onPress={(event) => {
        if (disabled || !steps.hasPrevStep) return
        onPress?.(event)
        if (!event.defaultPrevented) steps.goToPrevStep()
      }}
    />
  )
}
export type StepsNextTriggerProps = ButtonProps
function StepsNextTrigger({ disabled, onPress, ...props }: StepsNextTriggerProps) {
  const steps = useStepsContext()
  return (
    <Button
      size="sm"
      {...props}
      disabled={disabled || !steps.hasNextStep}
      onPress={(event) => {
        if (disabled || !steps.hasNextStep) return
        onPress?.(event)
        if (!event.defaultPrevented) steps.goToNextStep()
      }}
    />
  )
}
export const Steps = {
  Root: StepsRoot,
  RootProvider: StepsRootProvider,
  Context: StepsContext,
  List: StepsList,
  Item: StepsItem,
  ItemContext: StepsItemContext,
  Trigger: StepsTrigger,
  Indicator: StepsIndicator,
  Separator: StepsSeparator,
  Content: StepsContent,
  CompletedContent: StepsCompletedContent,
  Progress: StepsProgress,
  PrevTrigger: StepsPrevTrigger,
  NextTrigger: StepsNextTrigger,
}
