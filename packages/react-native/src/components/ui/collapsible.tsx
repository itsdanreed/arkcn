import type { ComponentPropsWithRef } from "react"
import { View } from "react-native"
import { Button, type ButtonProps } from "./button"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { usePanelPresence } from "../../lib/presence"
import { useNativeTheme } from "../../lib/theme"

/** Expandable content with controlled/uncontrolled state and accessible expanded-state announcements. */
export type CollapsibleRootProps = ComponentPropsWithRef<typeof View> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  disabled?: boolean
  lazyMount?: boolean
  unmountOnExit?: boolean
}
const [Provider, useCollapsible] = createRequiredContext<{
  open: boolean
  setOpen: (value: boolean) => void
  disabled: boolean
  lazyMount: boolean
  unmountOnExit: boolean
}>("Collapsible")
function CollapsibleRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: CollapsibleRootProps) {
  const [expanded, setOpen] = useControllable(open, defaultOpen, (open) => onOpenChange?.({ open }))
  return (
    <Provider value={{ open: expanded, setOpen, disabled, lazyMount, unmountOnExit }}>
      <View {...props} />
    </Provider>
  )
}
export type CollapsibleTriggerProps = ButtonProps
function CollapsibleTrigger({ disabled, onPress, accessibilityState, ...props }: CollapsibleTriggerProps) {
  const state = useCollapsible()
  const blocked = !!(disabled || state.disabled)
  return (
    <Button
      variant="ghost"
      {...props}
      disabled={blocked}
      aria-expanded={state.open}
      accessibilityState={{ ...accessibilityState, expanded: state.open }}
      onPress={(event) => {
        if (blocked) return
        onPress?.(event)
        if (!event.defaultPrevented) state.setOpen(!state.open)
      }}
    />
  )
}
export type CollapsibleContentProps = ComponentPropsWithRef<typeof View>
function CollapsibleContent({ style, ...props }: CollapsibleContentProps) {
  const { open, lazyMount, unmountOnExit } = useCollapsible()
  const mounted = usePanelPresence(open, lazyMount, unmountOnExit)
  if (!mounted) return null
  return (
    <View
      {...props}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? "auto" : "no-hide-descendants"}
      style={[style, !open && { display: "none" }]}
    />
  )
}
export type CollapsibleIndicatorProps = ComponentPropsWithRef<typeof View>
function CollapsibleIndicator({ children, style, ...props }: CollapsibleIndicatorProps) {
  const { open } = useCollapsible()
  const { colors, spacing } = useNativeTheme()
  return (
    <View accessible={false} {...props} style={[{ transform: [{ rotate: open ? "180deg" : "0deg" }] }, style]}>
      {children ?? (
        <View
          style={{
            width: spacing.buttonGap,
            height: spacing.buttonGap,
            borderRightWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: colors.mutedForeground,
            transform: [{ rotate: "45deg" }],
          }}
        />
      )}
    </View>
  )
}
export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Indicator: CollapsibleIndicator,
}
