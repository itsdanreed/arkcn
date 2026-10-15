import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react"
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  TextInput,
} from "react-native"
import { BlurView, type BlurViewProps } from "expo-blur"
import { X } from "lucide-react-native"
import { Button, type ButtonProps } from "./button"
import { createRequiredContext } from "../../lib/context"
import { useControllable } from "../../lib/controllable"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"

type FocusTarget = ComponentRef<typeof View> | ComponentRef<typeof Text> | ComponentRef<typeof TextInput>
type Insets = { top: number; right: number; bottom: number; left: number }
export type UseDialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  closeOnInteractOutside?: boolean
  /** Also governs Android Back and the screen reader escape gesture. */
  closeOnEscape?: boolean
  initialFocusRef?: RefObject<FocusTarget | null>
  finalFocusRef?: RefObject<FocusTarget | null>
  safeAreaInsets?: Insets
  /** Android blur requires a reference to a BlurTargetView around the app surface. */
  blurTarget?: BlurViewProps["blurTarget"]
  role?: "dialog" | "alertdialog"
}
function focus(target: FocusTarget | null | undefined, keyboard = false) {
  if (!target) return
  if (Platform.OS === "web" || keyboard) target.focus?.()
  if (Platform.OS !== "web") AccessibilityInfo.sendAccessibilityEvent(target, "focus")
}
export function useDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnInteractOutside = true,
  closeOnEscape = true,
  ...options
}: UseDialogProps = {}) {
  const [value, setOpen] = useControllable(open, defaultOpen, (open) => onOpenChange?.({ open }))
  const triggerRef = useRef<ComponentRef<typeof View>>(null)
  const titleRef = useRef<ComponentRef<typeof Text>>(null)
  const cancelRef = useRef<ComponentRef<typeof View>>(null)
  const id = useId()
  return {
    ...options,
    open: value,
    setOpen,
    closeOnInteractOutside,
    closeOnEscape,
    triggerRef,
    titleRef,
    cancelRef,
    titleId: `${id}-title`,
    descriptionId: `${id}-description`,
  }
}
export type DialogApi = ReturnType<typeof useDialog>
const [Provider, useDialogContext] = createRequiredContext<DialogApi>("Dialog")
export { useDialogContext }
export type DialogRootProps = UseDialogProps & { children: ReactNode }
function Root({ children, ...options }: DialogRootProps) {
  const value = useDialog(options)
  return <Provider value={value}>{children}</Provider>
}
function RootProvider({ value, children }: { value: DialogApi; children: ReactNode }) {
  return <Provider value={value}>{children}</Provider>
}
function Context({ children }: { children: (api: DialogApi) => ReactNode }) {
  return children(useDialogContext())
}
function Trigger({ onPress, ...props }: ButtonProps) {
  const api = useDialogContext()
  return (
    <Button
      variant="outline"
      ref={api.triggerRef}
      accessibilityState={{ expanded: api.open }}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) api.setOpen(true)
      }}
    />
  )
}
function CloseTrigger({ onPress, ...props }: ButtonProps) {
  const api = useDialogContext()
  return (
    <Button
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) api.setOpen(false)
      }}
    />
  )
}
const Presence = createContext({ visible: false, backdropDuration: 100 })
export type DialogBackdropProps = ComponentProps<typeof View>
function Backdrop({ style, ...props }: DialogBackdropProps) {
  const api = useDialogContext()
  const { visible, backdropDuration } = useContext(Presence)
  const { transition, reduced } = useMotion()
  return (
    <AnimatedView
      {...props}
      style={[
        {
          position: "absolute",
          inset: 0,
          opacity: visible ? 1 : 0,
          ...transition("opacity"),
          transitionDuration: reduced ? 0 : backdropDuration,
        },
        style,
      ]}
    >
      {Platform.OS === "web" ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 0,
            ...{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" },
          }}
        />
      ) : (
        <BlurView
          pointerEvents="none"
          style={{ position: "absolute", inset: 0 }}
          tint="default"
          intensity={20}
          blurTarget={api.blurTarget}
          blurMethod={api.blurTarget ? "dimezisBlurViewSdk31Plus" : "none"}
        />
      )}
      <Pressable
        accessible={false}
        importantForAccessibility="no"
        onPress={() => {
          if (api.closeOnInteractOutside) api.setOpen(false)
        }}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
      />
    </AnimatedView>
  )
}
export type DialogContentProps = ComponentProps<typeof View> & {
  showCloseButton?: boolean
  maxWidth?: number
  backdrop?: ReactNode
}
/** Shared modal surface; Sheet supplies its edge placement without changing Dialog defaults. */
export function DialogSurface({
  children,
  showCloseButton = true,
  maxWidth,
  backdrop,
  style,
  side,
  ...props
}: DialogContentProps & { side?: "top" | "right" | "bottom" | "left" }) {
  const api = useDialogContext()
  const { width, height } = useWindowDimensions()
  const { colors } = useNativeTheme()
  const { transition, reduced } = useMotion()
  const horizontal = side === "left" || side === "right"
  const duration = side ? 200 : 100
  const [present, setPresent] = useState(api.open)
  const [visible, setVisible] = useState(false)
  const latest = useRef(api)
  latest.current = api
  const wasOpen = useRef(api.open)
  useEffect(() => {
    if (api.open) {
      setPresent(true)
      wasOpen.current = true
    }
    const enter = setTimeout(() => setVisible(api.open), api.open ? 16 : 0)
    const exit =
      !api.open && wasOpen.current
        ? setTimeout(
            () => {
              setPresent(false)
              wasOpen.current = false
              // iOS restores accessibility focus after Modal's native dismissal; other hosts do it here.
              if (Platform.OS !== "ios")
                focus(latest.current.finalFocusRef?.current ?? latest.current.triggerRef.current)
            },
            reduced ? 0 : duration + 20
          )
        : undefined
    return () => {
      clearTimeout(enter)
      clearTimeout(exit)
    }
  }, [api.open, reduced, duration])
  const insets = api.safeAreaInsets ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const escape = () => {
    if (api.closeOnEscape) api.setOpen(false)
  }
  return (
    <Modal
      transparent
      visible={api.open || present}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={escape}
      onShow={() => {
        const target =
          api.initialFocusRef?.current ?? (api.role === "alertdialog" ? api.cancelRef.current : api.titleRef.current)
        focus(target, !!api.initialFocusRef?.current)
      }}
      onDismiss={() => {
        if (!latest.current.open) focus(latest.current.finalFocusRef?.current ?? latest.current.triggerRef.current)
      }}
    >
      <Presence.Provider value={{ visible, backdropDuration: side ? 150 : 100 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              paddingTop: side ? 0 : insets.top + 16,
              paddingBottom: side ? 0 : insets.bottom + 16,
              paddingLeft: side ? 0 : insets.left + 16,
              paddingRight: side ? 0 : insets.right + 16,
              alignItems: side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center",
              justifyContent: side === "top" ? "flex-start" : side === "bottom" ? "flex-end" : "center",
            }}
          >
            {backdrop ?? <Backdrop />}
            <AnimatedView
              {...props}
              role={api.role ?? "dialog"}
              aria-labelledby={api.titleId}
              aria-describedby={api.descriptionId}
              accessibilityViewIsModal
              onAccessibilityEscape={escape}
              style={[
                {
                  width: horizontal ? "75%" : "100%",
                  maxWidth:
                    maxWidth ??
                    (side ? (horizontal && width >= 640 ? 384 : undefined) : width >= 640 ? 384 : width - 32),
                  height: horizontal ? "100%" : undefined,
                  maxHeight: "100%",
                  minHeight: 0,
                  borderRadius: side ? 0 : 12,
                  borderColor: colors.border,
                  borderLeftWidth: side === "right" ? 1 : 0,
                  borderRightWidth: side === "left" ? 1 : 0,
                  borderTopWidth: side === "bottom" ? 1 : 0,
                  borderBottomWidth: side === "top" ? 1 : 0,
                  paddingTop: side && side !== "bottom" ? insets.top : 0,
                  paddingBottom: side && side !== "top" ? insets.bottom : 0,
                  paddingLeft: side ? insets.left : 0,
                  paddingRight: side ? insets.right : 0,
                  backgroundColor: colors.popover,
                  boxShadow: side
                    ? [
                        { offsetX: 0, offsetY: 10, blurRadius: 15, spreadDistance: -3, color: "rgba(0,0,0,0.1)" },
                        { offsetX: 0, offsetY: 4, blurRadius: 6, spreadDistance: -4, color: "rgba(0,0,0,0.1)" },
                      ]
                    : [{ offsetX: 0, offsetY: 0, spreadDistance: 1, color: withOpacity(colors.foreground, 0.1) }],
                  opacity: visible ? 1 : 0,
                  transform: side
                    ? horizontal
                      ? [{ translateX: visible ? 0 : side === "left" ? -40 : 40 }]
                      : [{ translateY: visible ? 0 : side === "top" ? -40 : 40 }]
                    : [{ scale: visible ? 1 : 0.95 }],
                  ...transition(["opacity", "transform"]),
                  transitionDuration: reduced ? 0 : duration,
                },
                style,
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                bounces={false}
                style={{
                  flexShrink: 1,
                  flexGrow: horizontal ? 1 : 0,
                  maxHeight: side ? undefined : height - insets.top - insets.bottom - 32,
                }}
                contentContainerStyle={{ padding: side ? 0 : 16, gap: 16, flexGrow: horizontal ? 1 : 0 }}
              >
                {children}
              </ScrollView>
              {showCloseButton && (
                <CloseTrigger
                  variant="ghost"
                  size="icon-sm"
                  accessibilityLabel={side ? "Close sheet" : "Close dialog"}
                  style={{
                    position: "absolute",
                    top: side ? 12 + (side === "bottom" ? 0 : insets.top) : 8,
                    right: side ? 12 + insets.right : 8,
                  }}
                >
                  <X size={16} color={colors.popoverForeground} />
                </CloseTrigger>
              )}
            </AnimatedView>
          </View>
        </KeyboardAvoidingView>
      </Presence.Provider>
    </Modal>
  )
}
function Content(props: DialogContentProps) {
  return <DialogSurface {...props} />
}
function Header({ style, ...props }: ComponentProps<typeof View>) {
  return <View {...props} style={[{ gap: 8 }, style]} />
}
function Title({ style, ...props }: ComponentProps<typeof Text>) {
  const api = useDialogContext()
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      ref={api.titleRef}
      nativeID={api.titleId}
      {...(Platform.OS === "web" ? { tabIndex: -1 } : {})}
      accessibilityRole="header"
      {...props}
      style={[{ ...typography.medium, color: colors.popoverForeground, fontSize: 16, lineHeight: 16 }, style]}
    />
  )
}
function Description({ style, ...props }: ComponentProps<typeof Text>) {
  const api = useDialogContext()
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      nativeID={api.descriptionId}
      {...props}
      style={[{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }, style]}
    />
  )
}
function Footer({
  style,
  children,
  showCloseButton = false,
  ...props
}: ComponentProps<typeof View> & { showCloseButton?: boolean }) {
  const { width } = useWindowDimensions()
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          marginHorizontal: -16,
          marginBottom: -16,
          padding: 16,
          gap: 8,
          borderTopWidth: 1,
          borderColor: colors.border,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          backgroundColor: withOpacity(colors.muted, 0.5),
          flexDirection: width >= 640 ? "row" : "column-reverse",
          justifyContent: "flex-end",
        },
        style,
      ]}
    >
      {children}
      {showCloseButton && <CloseTrigger variant="outline">Close</CloseTrigger>}
    </View>
  )
}
export const Dialog = {
  Root,
  RootProvider,
  Context,
  Trigger,
  CloseTrigger,
  Content,
  Backdrop,
  Header,
  Title,
  Description,
  Footer,
}
