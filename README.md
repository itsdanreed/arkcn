# Tide

shadcn/ui-style React components ported to [Ark UI](https://ark-ui.com), plus data-heavy primitives:
data grid, data table engine, kanban, gantt, scheduler, node graph, query builder, rich text editor
(tiptap), tree select, cascader, transfer list, virtual list, hotkeys, and more. Tailwind v4.

Every part is exported on its own, carries a `data-slot`, and is styled through Ark's data attributes.
Triggers are polymorphic via `asChild`.

## Install components

```bash
npx tideui init            # tide.json, src/lib/utils.ts, base styles, "@/" alias check, base deps
npx tideui add button card dialog data-grid
npx tideui list            # everything in the registry (--type all, `list data-grid --docs`)
npx tideui diff            # which installed files you changed locally
```

`init` writes `tide.json` (alias, `srcDir`, component/lib/hooks dirs, stylesheet), merges the
toolkit's tokens, custom variants, utilities, and keyframes into your stylesheet after
`@import "tailwindcss"` (between `/* tide:base */` markers, so re-running refreshes them),
makes sure the `@/*` path alias exists, and installs the base packages (Ark UI, lucide, clsx,
tailwind-merge, cva, tw-animate-css, the typography plugin). Tailwind v4 is required.

`add` copies the component **and everything it imports** (other components, `lib`, `hooks`) into
your project with imports rewritten to your alias, appends any component-specific CSS block, and
installs the packages those files need (tiptap for the editor, pragmatic drag and drop for kanban,
and so on). Files you have edited are kept unless you pass `--overwrite`; `diff --verbose` shows
what changed. `--no-install` skips the package manager, `--all` adds every component.

The components then belong to you: edit them freely, exactly as with shadcn/ui.

### Registry

The CLI reads a registry generated from this repo (`npm run build:registry` → `registry/`), bundled
in the npm package so a CLI version always installs a matching component set and works offline.
The same folder is committed here, so you can also read it from a URL, for example to pick up
components newer than your installed CLI:

```bash
npx tideui add kanban --registry https://raw.githubusercontent.com/itsdanreed/tide/main/registry
# or export TIDE_REGISTRY=...
```

Each item is `registry/items/<name>.json`: files with content, `registryDependencies`,
`dependencies` (with versions), an optional `css` fragment, and `docs`. `registry/index.json` is the
manifest and `registry/base.css` the init payload.

## MCP server

The package also ships an MCP server so agents (Claude Code, Cursor, and others) can browse the
registry, read documentation and source, and copy components into a project:

```json
{ "mcpServers": { "tideui": { "command": "npx", "args": ["-y", "-p", "tideui", "tideui-mcp"] } } }
```

Tools: `list_components`, `search_components`, `get_component` (source, deps, css, docs),
`get_docs`, `plan_install` (dry run against a project), `add_components` (writes files and CSS,
returns the packages to install). Pass `--registry=<url>` to read a hosted registry.

## Consume from node_modules instead

The demo app imports the package source directly: import `tideui/styles.css`,
alias `@/components/ui`, `@/lib`, and `@/hooks` to `node_modules/tideui/src/...`,
and add `@source "../node_modules/tideui/src"` because Tailwind does not scan
`node_modules`. Heavy dependencies (tiptap, pragmatic drag and drop, recharts, embla, date-fns,
react-day-picker, input-otp, react-resizable-panels, sonner, next-themes) are optional peers.

The demo application lives in the `tide-demo` repository.

## Develop

```bash
npm install
npm run check   # registry build + typecheck + lint (oxlint with Tailwind rules, quotes, Ark part coverage, Prettier) + CLI e2e test
npm publish     # prepublishOnly runs the same check
```
