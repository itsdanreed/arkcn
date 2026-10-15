import { createContext, useContext, useEffect, useState, type ComponentProps, type ReactNode } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import {
  Bell,
  Check,
  ChevronRight,
  ChevronsUpDown,
  Menu,
  Moon,
  PanelLeft,
  Search as SearchIcon,
  Sun,
  X,
} from "lucide-react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { AnimatedView, useMotion } from "../../lib/motion"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"
import { Avatar } from "./avatar"
import { Badge } from "./badge"

export type AppShellSidebarVariant = "sidebar" | "floating" | "inset"
export type AppShellSidebarCollapsible = "offcanvas" | "icon" | "none"
export type AppShellTheme = "light" | "dark" | "system"
type BoxProps = ComponentProps<typeof View>
type TextProps = ComponentProps<typeof Text>
type Insets = { top: number; bottom: number; left: number; right: number }
const noInsets = { top: 0, bottom: 0, left: 0, right: 0 }
const [ShellProvider, useAppShell] = createRequiredContext<{
  variant: AppShellSidebarVariant
  setVariant: (value: AppShellSidebarVariant) => void
  collapsible: AppShellSidebarCollapsible
  setCollapsible: (value: AppShellSidebarCollapsible) => void
  open: boolean
  setOpen: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  searchOpen: boolean
  setSearchOpen: (value: boolean) => void
  insets: Insets
}>("AppShell")
export { useAppShell }
export type AppShellRootProps = BoxProps & {
  variant?: AppShellSidebarVariant
  defaultVariant?: AppShellSidebarVariant
  onVariantChange?: (value: AppShellSidebarVariant) => void
  collapsible?: AppShellSidebarCollapsible
  defaultCollapsible?: AppShellSidebarCollapsible
  onCollapsibleChange?: (value: AppShellSidebarCollapsible) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (value: boolean) => void
  mobileOpen?: boolean
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (value: boolean) => void
  /** Insets used by full-screen overlays. Pad the root with SafeAreaView separately. */
  safeAreaInsets?: Insets
  /** Measured container width determines the layout, including embedded previews. */
  breakpoint?: number
}
function Root({
  variant,
  defaultVariant = "inset",
  onVariantChange,
  collapsible,
  defaultCollapsible = "icon",
  onCollapsibleChange,
  open,
  defaultOpen = true,
  onOpenChange,
  mobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  safeAreaInsets = noInsets,
  breakpoint = 768,
  onLayout,
  style,
  children,
  ...props
}: AppShellRootProps) {
  const viewport = useWindowDimensions()
  const [width, setWidth] = useState(viewport.width)
  const [layoutVariant, setVariant] = useControllable(variant, defaultVariant, onVariantChange)
  const [collapse, setCollapsible] = useControllable(collapsible, defaultCollapsible, onCollapsibleChange)
  const [expanded, setOpen] = useControllable(open, defaultOpen, onOpenChange)
  const [drawer, setMobileOpen] = useControllable(mobileOpen, defaultMobileOpen, onMobileOpenChange)
  const [searchOpen, setSearchOpen] = useState(false)
  const isMobile = width < breakpoint
  const { colors } = useNativeTheme()
  useEffect(() => {
    if (!isMobile || collapse === "none") setMobileOpen(false)
  }, [isMobile, collapse, setMobileOpen])
  return (
    <ShellProvider
      value={{
        variant: layoutVariant,
        setVariant,
        collapsible: collapse,
        setCollapsible,
        open: expanded,
        setOpen,
        mobileOpen: drawer,
        setMobileOpen,
        isMobile,
        toggleSidebar: () => (isMobile ? setMobileOpen(!drawer) : setOpen(!expanded)),
        searchOpen,
        setSearchOpen,
        insets: safeAreaInsets,
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
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            flexDirection: "row",
            backgroundColor: layoutVariant === "inset" ? colors.sidebar : colors.background,
          },
          style,
        ]}
      >
        {children}
      </View>
    </ShellProvider>
  )
}

/** Retains the modal through its exit transition; timers are cancelled on reversal/unmount. */
function Overlay({
  open,
  onClose,
  children,
  side,
  label,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  side?: "left" | "right"
  label: string
}) {
  const { colors } = useNativeTheme()
  const { insets } = useAppShell()
  const { reduced, transition } = useMotion()
  const [present, setPresent] = useState(open)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) setPresent(true)
    const timer = setTimeout(
      () => {
        setVisible(open)
        if (!open && reduced) setPresent(false)
      },
      open ? 16 : 0
    )
    const exit = !open ? setTimeout(() => setPresent(false), reduced ? 0 : 220) : undefined
    return () => {
      clearTimeout(timer)
      clearTimeout(exit)
    }
  }, [open, reduced])
  if (!open && !present) return null
  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: side ? "flex-start" : "center",
            alignItems: side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center",
          }}
        >
          <AnimatedView
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              opacity: visible ? 1 : 0,
              ...transition("opacity"),
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${label}`}
              onPress={onClose}
              style={{ flex: 1 }}
            />
          </AnimatedView>
          <AnimatedView
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            accessibilityLabel={label}
            style={{
              ...(side
                ? {
                    width: 288,
                    maxWidth: "85%",
                    height: "100%",
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    backgroundColor: colors.sidebar,
                    transform: [{ translateX: visible ? 0 : side === "left" ? -288 : 288 }],
                  }
                : {
                    width: 384,
                    maxWidth: "92%",
                    maxHeight: "80%",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    marginTop: insets.top,
                    marginBottom: insets.bottom,
                    opacity: visible ? 1 : 0,
                    transform: [{ scale: visible ? 1 : 0.95 }],
                  }),
              ...transition(["transform", "opacity"]),
              transitionDuration: reduced ? 0 : 200,
            }}
          >
            {children}
          </AnimatedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
const IconMode = createContext(false)
const CloseNavMenu = createContext<(() => void) | undefined>(undefined)
function Sidebar({
  side = "left",
  width = 256,
  style,
  children,
  ...props
}: BoxProps & { side?: "left" | "right"; width?: number }) {
  const shell = useAppShell()
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  const mobile = shell.isMobile && shell.collapsible !== "none"
  const icon = !mobile && !shell.open && shell.collapsible === "icon"
  const hidden = !mobile && !shell.open && shell.collapsible === "offcanvas"
  const padded = shell.collapsible !== "none" && shell.variant !== "sidebar"
  const body = (
    <IconMode.Provider value={icon}>
      <View
        {...props}
        style={[
          {
            flex: 1,
            minHeight: 0,
            backgroundColor: colors.sidebar,
            ...(shell.variant === "floating" && !mobile && padded
              ? {
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.sidebarBorder,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }
              : {}),
          },
          style,
        ]}
      >
        {children}
      </View>
    </IconMode.Provider>
  )
  if (mobile)
    return (
      <Overlay open={shell.mobileOpen} onClose={() => shell.setMobileOpen(false)} side={side} label="navigation">
        {body}
      </Overlay>
    )
  return (
    <AnimatedView
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      pointerEvents={hidden ? "none" : "auto"}
      style={{
        width: hidden ? 0 : icon ? (padded ? 64 : 48) : width,
        overflow: "hidden",
        padding: hidden ? 0 : padded ? 8 : 0,
        ...(shell.variant === "sidebar"
          ? {
              [side === "left" ? "borderRightWidth" : "borderLeftWidth"]: hidden ? 0 : 1,
              borderColor: colors.sidebarBorder,
            }
          : {}),
        ...transition(["width", "padding"]),
      }}
    >
      {body}
    </AnimatedView>
  )
}
function SidebarHeader({ style, ...props }: BoxProps) {
  return <View {...props} style={[{ padding: 8, gap: 8 }, style]} />
}
function SidebarFooter({ style, ...props }: BoxProps) {
  return <View {...props} style={[{ padding: 8, gap: 8, marginTop: "auto" }, style]} />
}
function SidebarContent({ contentContainerStyle, ...props }: ComponentProps<typeof ScrollView>) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      {...props}
      contentContainerStyle={[{ gap: 0 }, contentContainerStyle]}
    />
  )
}
function Nav({ style, ...props }: BoxProps) {
  return <View {...props} style={[{ padding: 8 }, style]} />
}
function NavLabel({ style, ...props }: TextProps) {
  const icon = useContext(IconMode)
  const { colors, typography } = useNativeTheme()
  if (icon) return null
  return (
    <Text
      {...props}
      style={[
        {
          ...typography.medium,
          height: 32,
          paddingHorizontal: 8,
          paddingVertical: 8,
          fontSize: 12,
          lineHeight: 16,
          color: withOpacity(colors.sidebarForeground, 0.7),
        },
        style,
      ]}
    />
  )
}
export type AppShellNavLinkProps = Omit<ButtonProps, "children"> & { children?: ReactNode } & {
  active?: boolean
  icon?: ReactNode
  label?: string
}
function NavLink({
  active = false,
  icon,
  label,
  children,
  onPress,
  style,
  accessibilityState,
  ...props
}: AppShellNavLinkProps) {
  const collapsed = useContext(IconMode)
  const closeMenu = useContext(CloseNavMenu)
  const shell = useAppShell()
  const { colors, typography } = useNativeTheme()
  return (
    <Button
      variant="ghost"
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ ...accessibilityState, selected: active }}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented && !props.disabled) {
          shell.setMobileOpen(false)
          closeMenu?.()
        }
      }}
      style={(state) => [
        {
          justifyContent: "flex-start",
          height: 32,
          minHeight: 32,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 8,
          borderRadius: 6,
          ...(active ? { backgroundColor: colors.sidebarAccent } : {}),
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {icon}
      {!collapsed &&
        (label ? (
          <Text
            numberOfLines={1}
            style={{
              ...(active ? typography.medium : typography.regular),
              color: colors.sidebarForeground,
              fontSize: 14,
              lineHeight: 20,
              flexShrink: 1,
            }}
          >
            {label}
          </Text>
        ) : (
          children
        ))}
      {!collapsed && label && children}
    </Button>
  )
}
function NavBadge({ style, ...props }: ComponentProps<typeof Badge.Root>) {
  const icon = useContext(IconMode)
  return icon ? null : <Badge.Root {...props} style={[{ marginLeft: "auto", borderRadius: 999 }, style]} />
}
function NavSubLink(props: AppShellNavLinkProps) {
  return <NavLink {...props} />
}
function NavCollapsible({
  label,
  icon,
  active,
  defaultOpen = false,
  children,
}: {
  label: string
  icon?: ReactNode
  active?: boolean
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen || !!active)
  const [menuOpen, setMenuOpen] = useState(false)
  const collapsed = useContext(IconMode)
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  useEffect(() => {
    if (!collapsed) setMenuOpen(false)
  }, [collapsed])
  return (
    <View>
      <NavLink
        icon={icon}
        label={undefined}
        accessibilityLabel={label}
        active={active}
        accessibilityState={{ expanded: collapsed ? menuOpen : open }}
        onPress={(event) => {
          event.preventDefault()
          if (collapsed) setMenuOpen(!menuOpen)
          else setOpen(!open)
        }}
      >
        <ShellText style={{ flex: 1 }}>{label}</ShellText>
        <AnimatedView style={{ transform: [{ rotate: open ? "90deg" : "0deg" }], ...transition("transform") }}>
          <ChevronRight size={16} color={colors.sidebarForeground} />
        </AnimatedView>
      </NavLink>
      {collapsed ? (
        <Overlay open={menuOpen} onClose={() => setMenuOpen(false)} label={label}>
          <DialogHeading title={label} onClose={() => setMenuOpen(false)} />
          <IconMode.Provider value={false}>
            <CloseNavMenu.Provider value={() => setMenuOpen(false)}>
              <View style={{ padding: 8 }}>{children}</View>
            </CloseNavMenu.Provider>
          </IconMode.Provider>
        </Overlay>
      ) : (
        open && (
          <View
            style={{
              marginHorizontal: 14,
              paddingHorizontal: 10,
              paddingVertical: 2,
              borderLeftWidth: 1,
              borderColor: colors.sidebarBorder,
            }}
          >
            {children}
          </View>
        )
      )}
    </View>
  )
}
function Brand({ style, onPress, ...props }: ButtonProps) {
  const icon = useContext(IconMode)
  const shell = useAppShell()
  return (
    <Button
      variant="ghost"
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) shell.setMobileOpen(false)
      }}
      style={(state) => [
        {
          justifyContent: "flex-start",
          paddingHorizontal: icon ? 0 : 8,
          height: icon ? 32 : 48,
          minHeight: icon ? 32 : 48,
          gap: 8,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  )
}
function BrandLogo({ style, ...props }: BoxProps) {
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.sidebarPrimary,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    />
  )
}
function BrandText({ style, ...props }: BoxProps) {
  const icon = useContext(IconMode)
  return icon ? null : <View {...props} style={[{ flex: 1, minWidth: 0 }, style]} />
}
function ShellText({ style, ...props }: TextProps) {
  const { typography, colors } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.regular, color: colors.sidebarForeground, fontSize: 14, lineHeight: 20 }, style]}
    />
  )
}
function BrandTitle({ style, ...props }: TextProps) {
  const { typography } = useNativeTheme()
  return <ShellText numberOfLines={1} {...props} style={[typography.medium, { lineHeight: 18 }, style]} />
}
function BrandDescription({ style, ...props }: TextProps) {
  return <ShellText numberOfLines={1} {...props} style={[{ fontSize: 12, lineHeight: 16 }, style]} />
}
function BrandChevron() {
  const icon = useContext(IconMode)
  const { colors } = useNativeTheme()
  return icon ? null : <ChevronsUpDown size={16} color={colors.sidebarForeground} />
}
function UserAvatar({
  src,
  fallback,
  ...props
}: ComponentProps<typeof Avatar.Root> & { src?: string; fallback: string }) {
  return (
    <Avatar.Root {...props}>
      {src && <Avatar.Image source={{ uri: src }} />}
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
    </Avatar.Root>
  )
}
function Content({ style, ...props }: BoxProps) {
  const { variant, isMobile, collapsible } = useAppShell()
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          backgroundColor: colors.background,
          ...(!isMobile && variant === "inset" && collapsible !== "none"
            ? {
                margin: 8,
                marginLeft: 0,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
              }
            : {}),
        },
        style,
      ]}
    />
  )
}
function SidebarTrigger({ onPress, ...props }: ButtonProps) {
  const shell = useAppShell()
  const { colors } = useNativeTheme()
  if (shell.collapsible === "none") return null
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      accessibilityLabel="Toggle Sidebar"
      accessibilityState={{ expanded: shell.isMobile ? shell.mobileOpen : shell.open }}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) shell.toggleSidebar()
      }}
    >
      <PanelLeft size={16} color={colors.foreground} />
    </Button>
  )
}
function Header({ showSidebarTrigger = true, children, style, ...props }: BoxProps & { showSidebarTrigger?: boolean }) {
  const shell = useAppShell()
  const { colors } = useNativeTheme()
  const { transition } = useMotion()
  return (
    <AnimatedView
      {...props}
      style={[
        {
          height: !shell.isMobile && !shell.open && shell.collapsible === "icon" ? 48 : 64,
          flexShrink: 0,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.background,
          ...transition("height"),
        },
        style,
      ]}
    >
      {showSidebarTrigger && shell.collapsible !== "none" && (
        <>
          <SidebarTrigger />
          <View style={{ width: 1, height: 16, backgroundColor: colors.border, marginRight: 8 }} />
        </>
      )}
      {children}
    </AnimatedView>
  )
}
function HeaderActions({ style, ...props }: BoxProps) {
  return (
    <View {...props} style={[{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 12 }, style]} />
  )
}
function Main({
  fluid = false,
  contentContainerStyle,
  style,
  ...props
}: ComponentProps<typeof ScrollView> & { fluid?: boolean }) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      {...props}
      style={[{ flex: 1, minHeight: 0 }, style]}
      contentContainerStyle={[
        { padding: 16, paddingTop: 0, width: "100%", maxWidth: fluid ? undefined : 1280, alignSelf: "center" },
        contentContainerStyle,
      ]}
    />
  )
}
function TopNav({ style, ...props }: BoxProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center" }, style]} />
}
function TopNavLink({ active, onPress, ...props }: ButtonProps & { active?: boolean }) {
  const closeMenu = useContext(CloseNavMenu)
  return (
    <Button
      variant="ghost"
      size="sm"
      accessibilityState={{ selected: active }}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) closeMenu?.()
      }}
    />
  )
}
function Search({
  placeholder = "Search",
  children,
  onPress,
  ...props
}: Omit<ButtonProps, "children"> & { children?: ReactNode; placeholder?: string }) {
  const shell = useAppShell()
  const { colors, typography } = useNativeTheme()
  return (
    <Button
      variant="outline"
      textStyle={{ ...typography.regular, color: colors.mutedForeground }}
      accessibilityLabel="Search workspace"
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) shell.setSearchOpen(true)
      }}
    >
      <SearchIcon size={16} color={colors.mutedForeground} />
      {children ?? placeholder}
    </Button>
  )
}
function DialogHeading({ title, onClose }: { title: string; onClose: () => void }) {
  const { colors, typography } = useNativeTheme()
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{ ...typography.medium, fontSize: 14, lineHeight: 20, color: colors.foreground, flex: 1 }}
      >
        {title}
      </Text>
      <Button variant="ghost" size="icon-sm" accessibilityLabel={`Close ${title}`} onPress={onClose}>
        <X size={16} color={colors.foreground} />
      </Button>
    </View>
  )
}
function CommandDialog({ title = "Search", children }: { title?: string; children: ReactNode }) {
  const shell = useAppShell()
  return (
    <Overlay open={shell.searchOpen} onClose={() => shell.setSearchOpen(false)} label="search">
      <DialogHeading title={title} onClose={() => shell.setSearchOpen(false)} />
      {children}
    </Overlay>
  )
}
function TopNavMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { colors } = useNativeTheme()
  return (
    <>
      <Button variant="outline" size="icon" accessibilityLabel="Open page navigation" onPress={() => setOpen(true)}>
        <Menu size={16} color={colors.foreground} />
      </Button>
      <Overlay open={open} onClose={() => setOpen(false)} label="page navigation">
        <DialogHeading title="Navigation" onClose={() => setOpen(false)} />
        <CloseNavMenu.Provider value={() => setOpen(false)}>
          <View style={{ padding: 8 }}>{children}</View>
        </CloseNavMenu.Provider>
      </Overlay>
    </>
  )
}
const [NotificationsProvider, useNotifications] = createRequiredContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>("AppShell.Notifications")
function Notifications({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [value, setOpen] = useControllable(open, defaultOpen, onOpenChange)
  return <NotificationsProvider value={{ open: value, setOpen }}>{children}</NotificationsProvider>
}
function NotificationsTrigger({ count = 0, onPress, ...props }: ButtonProps & { count?: number }) {
  const { setOpen } = useNotifications()
  const { colors, typography } = useNativeTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      accessibilityLabel={`Notifications, ${count} unread`}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) setOpen(true)
      }}
    >
      <Bell size={16} color={colors.foreground} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            right: 2,
            top: 2,
            borderRadius: 999,
            backgroundColor: colors.destructive,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ ...typography.medium, fontSize: 10, color: "white" }}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </Button>
  )
}
function NotificationsContent({ children }: { children: ReactNode }) {
  const { open, setOpen } = useNotifications()
  return (
    <Overlay open={open} onClose={() => setOpen(false)} label="notifications">
      <DialogHeading title="Notifications" onClose={() => setOpen(false)} />
      {children}
    </Overlay>
  )
}
function NotificationsList(props: ComponentProps<typeof ScrollView>) {
  return <ScrollView keyboardShouldPersistTaps="handled" {...props} />
}
function NotificationItem({ unread = false, style, ...props }: BoxProps & { unread?: boolean }) {
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: "row",
          gap: 12,
          padding: 14,
          backgroundColor: unread ? withOpacity(colors.muted, 0.5) : undefined,
        },
        style,
      ]}
    />
  )
}
function NotificationItemTitle({ style, ...props }: TextProps) {
  const { typography, colors } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.medium, color: colors.foreground, fontSize: 14, lineHeight: 20 }, style]}
    />
  )
}
function NotificationItemDescription({ style, ...props }: TextProps) {
  const { typography, colors } = useNativeTheme()
  return (
    <Text
      {...props}
      style={[{ ...typography.regular, color: colors.mutedForeground, fontSize: 12, lineHeight: 16 }, style]}
    />
  )
}
function NotificationItemContent({ style, ...props }: BoxProps) {
  return <View {...props} style={[{ flex: 1, gap: 4 }, style]} />
}
function NotificationsFooter({ style, ...props }: BoxProps) {
  const { colors } = useNativeTheme()
  return (
    <View
      {...props}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
        },
        style,
      ]}
    />
  )
}
function ThemeToggle({
  theme,
  onThemeChange,
}: {
  theme: AppShellTheme
  onThemeChange: (theme: AppShellTheme) => void
}) {
  const [open, setOpen] = useState(false)
  const { colors, colorScheme } = useNativeTheme()
  const { transition } = useMotion()
  return (
    <>
      <Button variant="outline" size="icon" accessibilityLabel="Choose theme" onPress={() => setOpen(true)}>
        <View style={{ width: 16, height: 16 }}>
          <AnimatedView
            style={{
              position: "absolute",
              opacity: colorScheme === "dark" ? 0 : 1,
              transform: [
                { rotate: colorScheme === "dark" ? "-90deg" : "0deg" },
                { scale: colorScheme === "dark" ? 0 : 1 },
              ],
              ...transition(["opacity", "transform"]),
            }}
          >
            <Sun size={16} color={colors.foreground} />
          </AnimatedView>
          <AnimatedView
            style={{
              position: "absolute",
              opacity: colorScheme === "dark" ? 1 : 0,
              transform: [
                { rotate: colorScheme === "dark" ? "0deg" : "90deg" },
                { scale: colorScheme === "dark" ? 1 : 0 },
              ],
              ...transition(["opacity", "transform"]),
            }}
          >
            <Moon size={16} color={colors.foreground} />
          </AnimatedView>
        </View>
      </Button>
      <Overlay open={open} onClose={() => setOpen(false)} label="theme">
        <DialogHeading title="Theme" onClose={() => setOpen(false)} />
        <View style={{ padding: 8, gap: 4 }}>
          {(["light", "dark", "system"] as const).map((value) => (
            <Button
              key={value}
              variant="ghost"
              accessibilityState={{ selected: theme === value }}
              onPress={() => {
                onThemeChange(value)
                setOpen(false)
              }}
              style={{ justifyContent: "space-between" }}
            >
              {value[0].toUpperCase() + value.slice(1)}
              {theme === value && <Check size={16} color={colors.foreground} />}
            </Button>
          ))}
        </View>
      </Overlay>
    </>
  )
}
export const AppShell = {
  Root,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  Brand,
  BrandLogo,
  BrandText,
  BrandTitle,
  BrandDescription,
  BrandChevron,
  User: Brand,
  UserAvatar,
  UserText: BrandText,
  UserName: BrandTitle,
  UserEmail: BrandDescription,
  Nav,
  NavLabel,
  NavList: View,
  NavItem: View,
  NavLink,
  NavBadge,
  NavCollapsible,
  NavSubItem: View,
  NavSubLink,
  Content,
  Header,
  HeaderActions,
  Main,
  TopNav,
  TopNavLink,
  TopNavMenu,
  Search,
  CommandDialog,
  Notifications,
  NotificationsTrigger,
  NotificationsContent,
  NotificationsList,
  NotificationsFooter,
  NotificationItem,
  NotificationItemContent,
  NotificationItemTitle,
  NotificationItemDescription,
  NotificationItemTime: NotificationItemDescription,
  ThemeToggle,
}
