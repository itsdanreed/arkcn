## How it works

`Highlight.Root` renders a standalone native text block with matching spans colored using the shared primary color at 15% opacity. Its default typography is 14px/20px, and colors follow the native light/dark theme. `style` customizes the surrounding text; `highlightStyle` customizes the matching spans’ foreground, background, and corner radius. Native Text props such as `selectable`, `numberOfLines`, and accessibility labels are supported.

Pass `text` and a literal `query`. As on the web, a single query matches its first occurrence by default; set `matchAll` to highlight every occurrence. An array of queries defaults to matching all occurrences. `ignoreCase` enables case-insensitive matching and `exactMatch` uses word boundaries. Regex punctuation is treated literally. Empty or unmatched queries leave the text unchanged.

`useHighlight` returns `{ text, match }` chunks for custom rendering. Both renderers use the same `@zag-js/highlight-word` utility, keeping matching behavior aligned without loading Ark UI or a browser runtime. The native registry installs this dependency with the component.

Native attributed text ignores corner radii, so Highlight measures each matched segment and draws rounded backgrounds behind the text. Wrapped matches are split at native line boundaries; the readable text remains a single accessible, selectable Text. Place the component in a View rather than inside another Text. Use `useHighlight` for custom inline rendering. Mixed-direction text and automatic font shrinking have not yet been visually verified.
