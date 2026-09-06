# UI Toolkit

shadcn/ui-style React components ported to [Ark UI](https://ark-ui.com), plus data-heavy primitives:
data grid, data table engine, kanban, gantt, scheduler, node graph, query builder, rich text editor
(tiptap), tree select, cascader, transfer list, virtual list, hotkeys, and more. Tailwind v4.

Every part is exported on its own, carries a `data-slot`, and is styled through Ark's data attributes.
Triggers are polymorphic via `asChild`.

## Use

The components are meant to be **copied into your project**, shadcn style: each file lands in
`src/components/ui`, shared helpers in `src/lib` and `src/hooks`, and the styles are merged into
your stylesheet after `@import "tailwindcss"`. Tailwind then scans them like any other project file.
A CLI (`init` / `add`) that does this is in progress; until then copy the files by hand. Every
component imports its siblings through the `@/` alias (`@/components/ui/button`, `@/lib/utils`).

The package can also be consumed directly from `node_modules` (this is what the demo app does):
import `@itsdanreed/ui-toolkit/styles.css`, alias `@/components/ui`, `@/lib`, and `@/hooks` to the
package source, and add `@source "../node_modules/@itsdanreed/ui-toolkit/src"` so Tailwind scans it,
since it does not scan `node_modules` on its own.

Heavy dependencies (tiptap, pragmatic drag and drop, recharts, embla, date-fns, react-day-picker,
input-otp, react-resizable-panels, sonner, next-themes) are optional peers: install the ones the
components you use need.

The demo application lives in the `ui-toolkit-demo` repository.

## Develop

```bash
npm install
npm run check   # typecheck + lint (oxlint with Tailwind rules, quotes, Ark part coverage, Prettier)
```
