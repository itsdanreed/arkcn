# arkcn React Native

Twenty-three native components for Expo and React Native: Button, Card, Input, Textarea, Badge, Separator, Spinner, Skeleton, Checkbox, Switch, RadioGroup, Tabs, Collapsible, Progress, Alert, Avatar, Toggle, ToggleGroup, Accordion, InputGroup, ButtonGroup, Label, and AspectRatio.

```tsx
import { Button, Card, Input } from "@multicomma/arkcn-react-native"
```

Uses React 19 and React Native 0.81 or later. Components follow system appearance; customize colors with
`NativeThemeProvider`. Use `onPress`, `onChangeText`, native accessibility props, and `style` overrides.
No Ark UI, React DOM, Tailwind, or Expo-specific runtime is required.

See the repository [native guide](https://github.com/itsdanreed/arkcn/blob/main/docs/content/react-native.md).
This is an initial component set, not full parity with the web catalog.

Motion uses Reanimated 4 with Worklets; SVG icons use react-native-svg and lucide-react-native. Install versions compatible with your Expo SDK or React Native release, configure Worklets, and load Geist for matching typography. The native guide covers setup and reduced-motion overrides.
