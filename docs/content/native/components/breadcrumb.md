## How it works

Compose `Breadcrumb.Root`, `List`, `Item`, `Link`, `Page`, and `Separator`. `Page` marks the current location; `Link` accepts `onPress` for your Expo Router, React Navigation, or application navigation callback. The example keeps its destination in local state so it can be tried without leaving the docs.

The native parts use the web control's regular 14px text, muted ancestor links, foreground current page, 6px list spacing, 4px item spacing, and 14px chevrons. Link hover/press feedback uses the shared color transition and honors reduced motion. Light/dark colors follow `NativeThemeProvider` or system appearance. Native font scaling stays enabled.

The list wraps at the available width; long labels can wrap within an item. `dir="rtl"` reverses the path and chevrons. Separators and ellipses are decorative and hidden from assistive technology. Links expose the native link role, while Page exposes a disabled, selected link with a current-page hint. Override accessibility labels/hints for localization.

`Ellipsis` supplies a 20px decorative container with a 16px more icon. To make omitted ancestors interactive, place it inside a Link with an explicit `accessibilityLabel` and an `onPress` that opens your own menu or navigation view. It does not open a menu by itself.

Use `style` for native layout and `textStyle` on Link for its automatic text labels. Compose explicit Text and icons for richer labels. There is no DOM navigation landmark, browser `href`, list numbering, or `asChild` API. The component does not own routing or launch URLs; the application handles navigation through `onPress`.
