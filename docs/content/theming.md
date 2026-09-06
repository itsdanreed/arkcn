# Theming

arkcn uses the same CSS variable scheme as shadcn/ui: semantic tokens (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, ...) defined on `:root` and overridden under `.dark`, exposed to Tailwind through `@theme inline` as `bg-background`, `text-muted-foreground`, and so on.

`init` writes these tokens into your stylesheet between `/* arkcn:base */` markers. Edit the values freely; re-running `init` will ask before replacing the block.

## Dark mode

The dark palette is applied by a `.dark` class on `<html>`. Any theme switcher works; the docs and demo use `next-themes` with `attribute="class"`.

## Custom variants

Ark UI exposes state through data attributes, and the base styles add Tailwind variants for the common ones so components can write `data-open:rotate-180` or `data-selected:bg-muted`:

| Variant | Matches |
| --- | --- |
| `data-open` / `data-closed` | `data-state="open"`, `data-open` |
| `data-checked` / `data-unchecked` | `data-state="checked"`, `data-checked` |
| `data-selected` | `data-selected` (any value but `"false"`) |
| `data-disabled` | `data-disabled` |
| `data-active` | `data-active` |
| `data-horizontal` / `data-vertical` | `data-orientation` |

## Radius and fonts

`--radius` drives every rounded corner. The base styles do not set a font; add your own to `--font-sans` in a `@theme` block.

## Component styles

A few components ship CSS that cannot be expressed as utilities, for example the rich text editor's ProseMirror styles. `add` appends those blocks to your stylesheet between `/* arkcn:component <name> */` markers.
