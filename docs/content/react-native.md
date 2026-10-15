# Expo / React Native

The native package supplies **55 components: Button, Card, Input, Textarea, Badge, Separator, Spinner, Skeleton, Checkbox, Switch, Radio Group, Tabs, Collapsible, Progress, Alert, Avatar, Toggle, Toggle Group, Accordion, Input Group, Button Group, Label, Aspect Ratio, Field, Fieldset, Number Input, Rating Group, Editable, Pagination, Segment Group, Breadcrumb, Empty, Kbd, Pin Input, Item, Steps, Highlight, Format, Tags Input, App Shell, Dialog, Alert Dialog, Sheet, Clipboard, Activity Feed, Timer, Message, Bubble, Marker, Attachment, Table, Password Input, Scroll Area, Slider, and Spreadsheet**.
It shares state hooks and headless logic with the web package while rendering React Native primitives.
The rest of the web catalog has not been ported yet.

## Copy into an app

Run inside an existing Expo or React Native app:

```bash
npx @multicomma/arkcn init --framework react-native
npx @multicomma/arkcn add button card input textarea badge separator spinner skeleton
npx @multicomma/arkcn add checkbox switch radio-group tabs collapsible progress alert avatar toggle toggle-group accordion
```

Expo and React Native dependencies are detected automatically when `--framework` is omitted. The choice is saved
in `arkcn.json` and used by `add`, `list`, and `diff`. Existing configs default to React web. Native init creates
`src/lib/theme.ts` and TypeScript aliases. It does not create a stylesheet or install web dependencies.
Expo uses TypeScript aliases automatically; bare React Native projects need matching bundler alias configuration.
Keep copied files outside an Expo Router route directory: the default `src/components/ui` and `src/lib` are suitable.

## Compose native parts

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function Profile() {
  const [name, setName] = useState("")
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>Choose a display name.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Input.Root accessibilityLabel="Display name" value={name} onChangeText={setName} />
      </Card.Content>
      <Card.Footer>
        <Button disabled={!name.trim()} onPress={() => console.log(name)}>Save</Button>
      </Card.Footer>
    </Card.Root>
  )
}
```

Alternatively import from `@multicomma/arkcn-react-native` or its `ui/*` and `lib/*` subpaths. Package imports
use normal relative imports internally and require no application alias. Install the package in an existing
app using `npx expo install @multicomma/arkcn-react-native` (Expo) or your package manager (bare React Native).
The packages must first be published; workspace development resolves them locally.

Native components accept native props: `onPress`, `onChangeText`, `style`, `accessibilityLabel`, and native refs.
They do not support DOM `asChild`, `className`, `onClick`, or web input events. Text content belongs in native
text components; Button wraps plain string/number children, and Card.Title, Card.Description, and Badge.Root
render native Text. Custom button content should contain native Text or icons, with an explicit accessible label
for icon-only buttons. Button preserves its label while loading and disables presses.

Input and Textarea support `disabled` and `invalid`, forward focus/blur handlers, and show focus/invalid styles.
Supply a meaningful accessible label and error explanation when invalid. Separator and Skeleton are decorative;
Skeleton pulses over two seconds. Spinner uses the same Lucide path as React with a one-second linear rotation. Switch movement, checkbox colors, button feedback, input focus, tabs, and progress use the web durations and easing. Radio and collapsible state changes remain immediate. System reduced motion disables loops and transitions.

## Theme and shared logic

Components follow system light/dark appearance by default. Wrap a subtree in `NativeThemeProvider` to override
`colorScheme` or semantic `colors`. Import the provider from your copied `@/lib/theme` or the native package.
Styles merge with caller styles last, and text keeps system font scaling enabled.

`lib/controllable`, `lib/history`, `lib/table`, `lib/time`, `lib/row-layout`, and `lib/data-table-adapter` can also
be copied with the CLI. Shared logic has no DOM or Ark UI dependencies. Gesture handling, focus, portals, and
accessibility behavior must be implemented separately when adding more native components.

## Interactive preview

The preview below renders the actual native components through React Native Web. Try entering a display name,
saving, resetting, and switching themes. This checks composition and interaction in a browser; validate final
screens on iOS and Android for keyboard, screen-reader, and platform layout behavior.

## Motion and icons

Animated components require Reanimated 4 and React Native Worklets; icons require `react-native-svg` and `lucide-react-native`. The CLI installs these when needed. In Expo, install the SDK-compatible versions:

```sh
npx expo install react-native-reanimated react-native-worklets react-native-svg
npm install lucide-react-native
```

Clipboard additionally requires `npx expo install expo-clipboard`. Dialog and Alert Dialog require `npx expo install expo-blur`. Bare React Native apps must configure Expo modules before using these components.

Expo's Babel preset configures Worklets. For bare React Native, use compatible Reanimated/Worklets versions, put `react-native-worklets/plugin` last in Babel's plugins, and rebuild the native app. Reanimated 4 requires the New Architecture.

`NativeThemeProvider reducedMotion` can override the system preference. Leave it unset to follow accessibility settings. Install and load Geist as described in Theming for matching device typography.

Attachment uses `@expo/ui` on Expo SDK 57 for masked upload animation and scrolling edge fades. Install the SDK-compatible version with `npx expo install @expo/ui`.
