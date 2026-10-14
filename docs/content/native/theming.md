# Native theming

Native components follow system appearance using semantic colors from `lib/theme.ts`. They need no CSS or Tailwind.

```tsx
import { NativeThemeProvider } from "@/lib/theme"

<NativeThemeProvider colorScheme="dark" colors={{ primary: "#2563eb", primaryForeground: "#ffffff" }}>
  {/* Native components */}
</NativeThemeProvider>
```

Leave `colorScheme` unset to follow the device. Override only the colors you need. Edit the shared spacing,
radius, typography, and control-height tokens when building your own design system.

All components merge caller styles last. Button accepts either a style object or a callback receiving `pressed`.
Use `textStyle` for its plain text label. Text scales with the system's font size settings.

## Shared design values

Both renderers use `packages/core/src/tokens.ts` as the source for light/dark palettes and control metrics.
`npm run build:tokens` generates the web CSS values; native converts the same OKLCH colors to sRGB.
Buttons share visible heights (24, 28, 32, 36), spacing, radii, and all six variants, including the tinted destructive
variant. Native buttons expand their hit area to at least 44 points. Cards share the inset spacing, surface,
subtle outline, and muted footer. Inputs and badges use the same semantic color treatment.

## Match the Geist font on devices

The docs load Geist in the browser. For identical typography in Expo, load the regular and medium faces and pass
the registered names to the provider. Bare React Native apps can register the same font files through their
native asset setup. Without a loaded font, native uses the system font.

```bash
npx expo install @expo-google-fonts/geist expo-font
```

```tsx
import type { ReactNode } from "react"
import { useFonts } from "@expo-google-fonts/geist/useFonts"
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular"
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium"
import { NativeThemeProvider } from "@/lib/theme"

export function AppTheme({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium })
  if (error) throw error
  if (!loaded) return null // Keep your splash screen visible until fonts are ready.
  return (
    <NativeThemeProvider fonts={{ regular: "Geist_400Regular", medium: "Geist_500Medium" }}>
      {children}
    </NativeThemeProvider>
  )
}
```
