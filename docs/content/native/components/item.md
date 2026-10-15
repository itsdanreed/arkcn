## How it works

Compose `Item.Root`, `Media`, `Content`, `Title`, `Description`, and `Actions` for list rows. `variant` supports default, outline, and muted surfaces. The default and sm sizes use 12px horizontal padding, 10px vertical padding, and a 10px gap; xs uses 10px, 8px, and an 8px gap. Colors follow NativeThemeProvider and system appearance.

Titles use 14px medium text and one-line truncation. Descriptions use 14px regular text (12px for xs) and two-line truncation. Both are native Text components: inline content must be Text-compatible. Override `numberOfLines` when content should expand, including at large accessibility text sizes.

`Media variant="icon"` defaults direct icon children to 16px and the theme foreground. `variant="image"` clips to a rounded 40px square (32px for sm, 24px for xs); direct React Native Image children fill it using cover sizing. Custom image components should provide their own fill styles. Media aligns to the top with a 2px optical offset when a Description appears in the declared children. Use `align="start"` or `align="center"` for content hidden inside custom components.

`Content` grows to take remaining space. A directly adjacent second Content does not grow, matching the web layout; `grow` is also available explicitly. `Header` and `Footer` span the row, with space between their children. `Actions` lays out standard native Buttons with an 8px gap. Root is a noninteractive View; use explicit actions or an accessible Pressable around the row for navigation. Avoid nesting interactive actions inside a row-wide press target.

`Group` uses 16px spacing, reduced to 10px when it contains sm rows or 8px for xs rows. Set Group's `size` explicitly when rows are hidden inside custom components. `Separator` uses the shared native divider with 8px vertical margins. For large lists, render Item rows inside FlatList rather than using Group as a virtualized list.
