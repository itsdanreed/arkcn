## How it works

Compose `Empty.Root`, `Header`, `Media`, `Title`, `Description`, and `Content` for empty results, missing content, and onboarding prompts. Actions in Content are standard native Buttons or other application controls; Empty itself owns no navigation or data state.

The layout uses the web component's spacing, centered 14px title, relaxed description line height, rounded corners, and a maximum content width of 384px. `Media variant="icon"` supplies the 32px muted tile and defaults direct icon children to 16px with the theme foreground color. Explicit icon size/color props are preserved. The default Media variant leaves illustrations and other custom content untouched.

The root is intrinsically sized on native to avoid filling an unbounded ScrollView. Use `style={{ flex: 1 }}` inside a bounded container when it should fill the available space. The dashed border style is available, but no border is visible until you set a border width, matching the web default.

Colors follow the system or NativeThemeProvider. Native text scaling stays enabled and the layout grows with its content. Description and Title are Text components, so rich inline content must use native Text descendants. Plain descriptions inside Header balance short text across lines while preserving the original line count, matching the web treatment. Rich text, descriptions longer than six lines, explicit widths, and truncated text use normal native wrapping. Style a nested description link explicitly using native text styles and `onPress`; there are no CSS descendant selectors or DOM anchors.
