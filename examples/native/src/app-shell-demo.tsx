import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { Bell, BookOpen, Boxes, Folder, Home, Inbox, Settings, Users } from "lucide-react-native"
import { AppShell, useAppShell, type AppShellTheme } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useNativeTheme } from "@/lib/theme"

const pages = ["Overview", "Inbox", "Projects", "Team", "Settings"]
export function AppShellDemo({
  theme,
  onThemeChange,
  onGallery,
  reducedMotion,
  toggleMotion,
}: {
  theme: AppShellTheme
  onThemeChange: (theme: AppShellTheme) => void
  onGallery: () => void
  reducedMotion: boolean
  toggleMotion: () => void
}) {
  const { colors, colorScheme } = useNativeTheme()
  const insets = useSafeAreaInsets()
  const [page, setPage] = useState("Overview")
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.sidebar }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <AppShell.Root safeAreaInsets={insets} breakpoint={700}>
        <AppShell.Sidebar>
          <AppShell.SidebarHeader>
            <AppShell.Brand accessibilityLabel="Acme workspace" onPress={() => setPage("Overview")}>
              <AppShell.BrandLogo>
                <Boxes size={16} color={colors.sidebarPrimaryForeground} />
              </AppShell.BrandLogo>
              <AppShell.BrandText>
                <AppShell.BrandTitle>Acme</AppShell.BrandTitle>
                <AppShell.BrandDescription>Workspace</AppShell.BrandDescription>
              </AppShell.BrandText>
            </AppShell.Brand>
          </AppShell.SidebarHeader>
          <AppShell.SidebarContent>
            <AppShell.Nav>
              <AppShell.NavLabel>Workspace</AppShell.NavLabel>
              <AppShell.NavList>
                {[
                  ["Overview", Home],
                  ["Inbox", Inbox],
                  ["Projects", Folder],
                  ["Team", Users],
                  ["Settings", Settings],
                ].map(([name, Icon]) => {
                  const Label = name as string
                  const Glyph = Icon as typeof Home
                  return (
                    <AppShell.NavItem key={Label}>
                      <AppShell.NavLink
                        label={Label}
                        icon={<Glyph size={16} color={colors.sidebarForeground} />}
                        active={page === Label}
                        onPress={() => setPage(Label)}
                      />
                    </AppShell.NavItem>
                  )
                })}
                <AppShell.NavCollapsible
                  label="Resources"
                  icon={<BookOpen size={16} color={colors.sidebarForeground} />}
                >
                  <AppShell.NavSubLink
                    label="Documentation"
                    active={page === "Documentation"}
                    onPress={() => setPage("Documentation")}
                  />
                  <AppShell.NavSubLink
                    label="Changelog"
                    active={page === "Changelog"}
                    onPress={() => setPage("Changelog")}
                  />
                </AppShell.NavCollapsible>
              </AppShell.NavList>
            </AppShell.Nav>
          </AppShell.SidebarContent>
          <AppShell.SidebarFooter>
            <AppShell.User accessibilityLabel="Alex Morgan, account settings" onPress={() => setPage("Settings")}>
              <AppShell.UserAvatar fallback="AM" />
              <AppShell.UserText>
                <AppShell.UserName>Alex Morgan</AppShell.UserName>
                <AppShell.UserEmail>alex@example.com</AppShell.UserEmail>
              </AppShell.UserText>
            </AppShell.User>
          </AppShell.SidebarFooter>
        </AppShell.Sidebar>
        <AppShell.Content>
          <AppShell.Header>
            <Heading size={14}>{page}</Heading>
            <AppShell.HeaderActions>
              <DemoNotifications />
              <AppShell.ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            </AppShell.HeaderActions>
          </AppShell.Header>
          <AppShell.Main key={page} contentContainerStyle={{ gap: 20 }}>
            <View style={{ gap: 8 }}>
              <Heading size={24}>{page === "Overview" ? "Your workspace at a glance." : page}</Heading>
              <Copy>
                {page === "Inbox"
                  ? "You're all caught up. New messages will appear here."
                  : page === "Projects"
                    ? "Three projects are moving forward this week."
                    : "Welcome back, Alex. Here's what's happening with your team."}
              </Copy>
            </View>
            <AppShell.Search style={{ justifyContent: "flex-start" }} placeholder="Search your workspace…" />
            {page === "Settings" ? (
              <LayoutSettings reducedMotion={reducedMotion} toggleMotion={toggleMotion} />
            ) : (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {[
                    ["Active projects", "12", "+2 this month"],
                    ["Team members", "24", "Across 4 teams"],
                  ].map(([title, value, description]) => (
                    <Card.Root key={title} style={{ flex: 1, minWidth: 140 }}>
                      <Card.Header>
                        <Card.Description>{title}</Card.Description>
                        <Card.Title style={{ fontSize: 28, lineHeight: 36 }}>{value}</Card.Title>
                      </Card.Header>
                      <Card.Content>
                        <Copy>{description}</Copy>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </View>
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Recent activity</Card.Title>
                    <Card.Description>The latest from your team.</Card.Description>
                  </Card.Header>
                  <Card.Content style={{ gap: 20 }}>
                    {[
                      ["Design system", "Jordan updated the component library.", "12 min ago"],
                      ["Website refresh", "Sam completed the homepage review.", "48 min ago"],
                      ["Mobile app", "You created the Expo workspace.", "2 hours ago"],
                    ].map(([title, description, time]) => (
                      <View key={title} style={{ gap: 4 }}>
                        <Heading size={14}>{title}</Heading>
                        <Copy>{description}</Copy>
                        <Copy small>{time}</Copy>
                      </View>
                    ))}
                  </Card.Content>
                </Card.Root>
                <LayoutSettings reducedMotion={reducedMotion} toggleMotion={toggleMotion} />
              </>
            )}
            <Button variant="outline" onPress={onGallery}>
              Component gallery
            </Button>
          </AppShell.Main>
        </AppShell.Content>
        <DemoSearch navigate={setPage} />
      </AppShell.Root>
    </SafeAreaView>
  )
}
function Heading({ children, size }: { children: string; size: number }) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      accessibilityRole="header"
      style={{ ...typography.medium, fontSize: size, lineHeight: size === 24 ? 32 : 20, color: colors.foreground }}
    >
      {children}
    </Text>
  )
}
function Copy({ children, small = false }: { children: string; small?: boolean }) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      style={{
        ...typography.regular,
        fontSize: small ? 12 : 14,
        lineHeight: small ? 16 : 20,
        color: colors.mutedForeground,
      }}
    >
      {children}
    </Text>
  )
}
function LayoutSettings({ reducedMotion, toggleMotion }: { reducedMotion: boolean; toggleMotion: () => void }) {
  const shell = useAppShell()
  return (
    <View style={{ gap: 12 }}>
      <Heading size={14}>Shell appearance</Heading>
      <Copy>Rotate to landscape to try the persistent sidebar and its collapse modes.</Copy>
      <View style={{ gap: 8 }}>
        <Copy small>Layout variant</Copy>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["sidebar", "floating", "inset"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={shell.variant === value ? "default" : "outline"}
              accessibilityLabel={`${value} layout`}
              accessibilityState={{ selected: shell.variant === value }}
              onPress={() => shell.setVariant(value)}
            >
              {value}
            </Button>
          ))}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Copy small>Sidebar behavior</Copy>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(["icon", "offcanvas", "none"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={shell.collapsible === value ? "default" : "outline"}
              accessibilityLabel={`${value} sidebar`}
              accessibilityState={{ selected: shell.collapsible === value }}
              onPress={() => shell.setCollapsible(value)}
            >
              {value}
            </Button>
          ))}
        </View>
      </View>
      <Button variant="ghost" onPress={toggleMotion} style={{ alignSelf: "flex-start" }}>
        {reducedMotion ? "Enable motion" : "Reduce motion"}
      </Button>
    </View>
  )
}
function DemoSearch({ navigate }: { navigate: (page: string) => void }) {
  const shell = useAppShell()
  const [query, setQuery] = useState("")
  const results = pages.filter((page) => page.toLowerCase().includes(query.toLowerCase()))
  return (
    <AppShell.CommandDialog>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 12, gap: 12 }}>
        <Input.Root
          accessibilityLabel="Search pages"
          placeholder="Search pages…"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        <View style={{ gap: 4 }}>
          {results.length ? (
            results.map((page) => (
              <Button
                key={page}
                variant="ghost"
                onPress={() => {
                  navigate(page)
                  shell.setSearchOpen(false)
                  setQuery("")
                }}
                style={{ justifyContent: "flex-start" }}
              >
                {page}
              </Button>
            ))
          ) : (
            <Copy>No pages found.</Copy>
          )}
        </View>
      </ScrollView>
    </AppShell.CommandDialog>
  )
}
function DemoNotifications() {
  const [unread, setUnread] = useState(2)
  const { colors } = useNativeTheme()
  return (
    <AppShell.Notifications>
      <AppShell.NotificationsTrigger count={unread} />
      <AppShell.NotificationsContent>
        <AppShell.NotificationsList>
          {[
            ["Review requested", "Jordan invited you to review the design system.", "12 minutes ago"],
            ["Project updated", "The mobile app is ready for testing.", "48 minutes ago"],
          ].map(([title, description, time]) => (
            <AppShell.NotificationItem key={title} unread={unread > 0}>
              <Bell size={16} color={colors.mutedForeground} />
              <AppShell.NotificationItemContent>
                <AppShell.NotificationItemTitle>{title}</AppShell.NotificationItemTitle>
                <AppShell.NotificationItemDescription>{description}</AppShell.NotificationItemDescription>
                <AppShell.NotificationItemTime>{time}</AppShell.NotificationItemTime>
              </AppShell.NotificationItemContent>
            </AppShell.NotificationItem>
          ))}
        </AppShell.NotificationsList>
        <AppShell.NotificationsFooter>
          <Button variant="ghost" size="sm" onPress={() => setUnread(0)}>
            Mark all as read
          </Button>
        </AppShell.NotificationsFooter>
      </AppShell.NotificationsContent>
    </AppShell.Notifications>
  )
}
