## How it works

Attachment provides Root, Group, Media, Content, Title, Description, Actions, ActionTrigger, and Trigger. It supports default/sm/xs sizes, horizontal/vertical orientation, and idle/uploading/processing/error/done states. Layout and colors follow the audited web component in both themes.

Install `@expo/ui` with `npx expo install @expo/ui` on Expo SDK 57. Uploading and processing titles use Expo UI MaskedView with a native Text mask and a two-second Reanimated gradient sweep. Reduced motion keeps the title static. Browser previews use background-clipped text. Native text retains font scaling and truncation. The decorative mask is hidden from accessibility.

Media sizes lucide icons automatically. For images use `variant="image"` with a React Native Image child; it fills the square preview with cover scaling. Supply Image's loading/error handlers and your own fallback when needed. The state does not perform an upload or infer image-loading status.

Trigger covers the card; Actions sit above it so cancel, retry, and download remain independent. Use `accessibilityLabel` on every icon-only action and card trigger. ActionTrigger uses the existing arkcn Button unchanged with ghost/icon-xs defaults. `onPress` replaces web `onClick`; navigation, picking, uploading, downloading, and persistence remain consumer-owned.

Group is a horizontal native ScrollView with 12px gaps, 4px vertical padding, measured card snap points, and masked edge fades. Scroll-driven masks run on the UI thread. Standard ScrollView callbacks and imperative refs remain available. Root discovers Content and Media through ordinary children and fragments; use `hasContent`/`hasMedia` when custom components hide those parts. All parts accept native style overrides.
