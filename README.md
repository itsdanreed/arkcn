# UI Toolkit

shadcn/ui-style React components ported to [Ark UI](https://ark-ui.com), plus data-heavy primitives:
data grid, data table engine, kanban, gantt, scheduler, node graph, query builder, rich text editor
(tiptap), tree select, cascader, transfer list, virtual list, hotkeys, and more. Tailwind v4.

Every part is exported on its own, carries a `data-slot`, and is styled through Ark's data attributes.
Triggers are polymorphic via `asChild`.

## Use

```css
@import "tailwindcss";
@import "@itsdanreed/ui-toolkit/styles.css";
@source "../node_modules/@itsdanreed/ui-toolkit/src";
```

Components import each other through the `@/` alias (`@/components/ui/button`, `@/lib/utils`), so point
that alias at the package source, or copy the files you need into your own `src/components/ui`:

```json
{ "paths": { "@/components/ui/*": ["./node_modules/@itsdanreed/ui-toolkit/src/components/ui/*"], "@/lib/*": ["./node_modules/@itsdanreed/ui-toolkit/src/lib/*"], "@/hooks/*": ["./node_modules/@itsdanreed/ui-toolkit/src/hooks/*"], "@/*": ["./src/*"] } }
```

Heavy dependencies (tiptap, pragmatic drag and drop, recharts, embla, date-fns, react-day-picker,
input-otp, react-resizable-panels, sonner, next-themes) are optional peers: install the ones the
components you use need.

The demo application lives in the `ui-toolkit-demo` repository.

## Develop

```bash
npm install
npm run check   # typecheck + lint (oxlint with Tailwind rules, quotes, Ark part coverage, Prettier)
```
