import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Geist_400Regular, Geist_500Medium, useFonts } from "@expo-google-fonts/geist"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { NativeThemeProvider, useNativeTheme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { demos } from "./demos"

export default function App() {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium })
  const [dark, setDark] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  if (error) throw error
  if (!loaded) return null
  return (
    <SafeAreaProvider>
      <NativeThemeProvider
        colorScheme={dark ? "dark" : "light"}
        reducedMotion={reducedMotion}
        fonts={{ regular: "Geist_400Regular", medium: "Geist_500Medium" }}
      >
        <Gallery
          dark={dark}
          reducedMotion={reducedMotion}
          toggleTheme={() => setDark(!dark)}
          toggleMotion={() => setReducedMotion(!reducedMotion)}
        />
      </NativeThemeProvider>
    </SafeAreaProvider>
  )
}

function Gallery({
  dark,
  reducedMotion,
  toggleTheme,
  toggleMotion,
}: {
  dark: boolean
  reducedMotion: boolean
  toggleTheme: () => void
  toggleMotion: () => void
}) {
  const { colors, typography } = useNativeTheme()
  const [selected, setSelected] = useState("spinner")
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
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
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
          <Component />
        </View>
        <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}>
          The same examples as the docs, installed through the arkcn CLI. Check both themes, interactions, and reduced
          motion.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
