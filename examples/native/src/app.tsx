import { useState } from "react"
import { ScrollView, Text, View, useColorScheme } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Geist_400Regular, Geist_500Medium, useFonts } from "@expo-google-fonts/geist"
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { NativeThemeProvider, useNativeTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { SpreadsheetValidation } from "./spreadsheet-validation"
import { SliderValidation } from "./slider-validation"
import { ScrollAreaValidation } from "./scroll-area-validation"
import { PasswordInputValidation } from "./password-input-validation"
import { TableValidation } from "./table-validation"
import { AttachmentValidation } from "./attachment-validation"
import { MarkerValidation } from "./marker-validation"
import { MessageValidation } from "./message-validation"
import { TimerValidation } from "./timer-validation"
import { ActivityFeedValidation } from "./activity-feed-validation"
import { ClipboardValidation } from "./clipboard-validation"
import { SheetValidation } from "./sheet-validation"
import { DialogValidation } from "./dialog-validation"
import { AppShellDemo } from "./app-shell-demo"
import type { AppShellTheme } from "@/components/ui/app-shell"
import { demos } from "./demos"
import { EditableValidation } from "./editable-validation"
import { SegmentGroupValidation } from "./segment-group-validation"
import { BreadcrumbValidation } from "./breadcrumb-validation"
import { HighlightValidation } from "./highlight-validation"
import { TagsInputValidation } from "./tags-input-validation"
import { FormatValidation } from "./format-validation"
import { StepsValidation } from "./steps-validation"
import { PinInputValidation } from "./pin-input-validation"

export default function App() {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium })
  const [theme, setTheme] = useState<AppShellTheme>("light")
  const [shell, setShell] = useState(true)
  const systemScheme = useColorScheme()
  const dark = theme === "dark" || (theme === "system" && systemScheme === "dark")
  const [reducedMotion, setReducedMotion] = useState(false)
  if (error) throw error
  if (!loaded) return null
  return (
    <SafeAreaProvider>
      <NativeThemeProvider
        colorScheme={theme === "system" ? undefined : theme}
        reducedMotion={reducedMotion}
        fonts={{ regular: "Geist_400Regular", medium: "Geist_500Medium" }}
      >
        {shell ? (
          <AppShellDemo
            theme={theme}
            onThemeChange={setTheme}
            onGallery={() => setShell(false)}
            reducedMotion={reducedMotion}
            toggleMotion={() => setReducedMotion(!reducedMotion)}
          />
        ) : (
          <Gallery
            dark={dark}
            reducedMotion={reducedMotion}
            toggleTheme={() => setTheme(dark ? "light" : "dark")}
            openShell={() => setShell(true)}
            toggleMotion={() => setReducedMotion(!reducedMotion)}
          />
        )}
      </NativeThemeProvider>
    </SafeAreaProvider>
  )
}

function Gallery({
  dark,
  reducedMotion,
  toggleTheme,
  toggleMotion,
  openShell,
}: {
  dark: boolean
  reducedMotion: boolean
  openShell: () => void
  toggleTheme: () => void
  toggleMotion: () => void
}) {
  const { colors, typography } = useNativeTheme()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState("spreadsheet")
  const { Component } = demos.find(({ name }) => name === selected)!
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={{ padding: 20, gap: 12, borderBottomWidth: 1, borderColor: colors.border }}>
        <Text style={{ ...typography.medium, color: colors.foreground, fontSize: 24, lineHeight: 32 }}>
          arkcn native
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button variant="outline" onPress={toggleTheme}>
            {dark ? "Light theme" : "Dark theme"}
          </Button>
          <Button variant="outline" onPress={toggleMotion}>
            {reducedMotion ? "Enable motion" : "Reduce motion"}
          </Button>
        </View>
        <Button variant="outline" onPress={openShell}>
          Open App Shell
        </Button>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }} showsHorizontalScrollIndicator={false}>
          {demos.map(({ name }) => (
            <Button
              key={name}
              size="sm"
              variant={name === selected ? "default" : "ghost"}
              onPress={() => setSelected(name)}
            >
              {name}
            </Button>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text
          accessibilityRole="header"
          style={{ ...typography.medium, color: colors.foreground, fontSize: 18, lineHeight: 24 }}
        >
          {selected}
        </Text>
        <View
          key={selected}
          style={{
            minHeight: 240,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
          }}
        >
          <Component {...(selected === "sheet" ? { safeAreaInsets: insets } : {})} />
        </View>
        {(selected === "message" || selected === "bubble") && <MessageValidation />}
        {selected === "attachment" && <AttachmentValidation />}
        {selected === "table" && <TableValidation />}
        {selected === "password-input" && <PasswordInputValidation />}
        {selected === "scroll-area" && <ScrollAreaValidation />}
        {selected === "slider" && <SliderValidation />}
        {selected === "spreadsheet" && <SpreadsheetValidation />}
        {selected === "marker" && <MarkerValidation />}
        {selected === "timer" && <TimerValidation />}
        {selected === "activity-feed" && <ActivityFeedValidation />}
        {selected === "clipboard" && <ClipboardValidation />}
        {selected === "sheet" && <SheetValidation />}
        {(selected === "dialog" || selected === "alert-dialog") && <DialogValidation />}
        {selected === "editable" && <EditableValidation />}
        {selected === "segment-group" && <SegmentGroupValidation />}
        {selected === "breadcrumb" && <BreadcrumbValidation />}
        {selected === "pin-input" && <PinInputValidation />}
        {selected === "steps" && <StepsValidation />}
        {selected === "format" && <FormatValidation />}
        {selected === "tags-input" && <TagsInputValidation />}
        {selected === "highlight" && <HighlightValidation />}
        <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}>
          The same examples as the docs, installed through the arkcn CLI. Check both themes, interactions, and reduced
          motion.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
