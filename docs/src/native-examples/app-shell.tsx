import { Text } from "react-native"
import { Home, Inbox } from "lucide-react-native"
import { AppShell } from "@multicomma/arkcn-react-native/ui/app-shell"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

export default function AppShellExample() {
  const { colors, typography } = useNativeTheme()
  return (
    <AppShell.Root
      defaultCollapsible="none"
      defaultVariant="sidebar"
      style={{
        height: 320,
        width: "100%",
        flex: undefined,
        overflow: "hidden",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <AppShell.Sidebar width={160}>
        <AppShell.Brand accessibilityLabel="Acme workspace">
          <AppShell.BrandText>
            <AppShell.BrandTitle>Acme</AppShell.BrandTitle>
            <AppShell.BrandDescription>Workspace</AppShell.BrandDescription>
          </AppShell.BrandText>
        </AppShell.Brand>
        <AppShell.Nav>
          <AppShell.NavLabel>Workspace</AppShell.NavLabel>
          <AppShell.NavList>
            <AppShell.NavLink active label="Overview" icon={<Home size={16} color={colors.sidebarForeground} />} />
            <AppShell.NavLink label="Inbox" icon={<Inbox size={16} color={colors.sidebarForeground} />} />
          </AppShell.NavList>
        </AppShell.Nav>
      </AppShell.Sidebar>
      <AppShell.Content>
        <AppShell.Header>
          <AppShell.TopNav>
            <AppShell.TopNavLink active>Overview</AppShell.TopNavLink>
          </AppShell.TopNav>
        </AppShell.Header>
        <AppShell.Main>
          <Text style={{ ...typography.medium, color: colors.foreground, fontSize: 18, lineHeight: 28 }}>Overview</Text>
          <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}>
            Your workspace at a glance.
          </Text>
        </AppShell.Main>
      </AppShell.Content>
    </AppShell.Root>
  )
}
