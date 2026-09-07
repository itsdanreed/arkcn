# Changelog

## 0.1.4

- Fix Steps and Timer trigger composition with `asChild`, and keep Tour controls above the backdrop.
- Give the color picker's value swatch rounded square corners.
- Repair documentation examples for search, color selection, countdowns, pagination, navigation, and action feedback.
- Reset previews between component routes and fix mobile header, carousel, and chat layouts.
- Audit all 111 documentation pages, including interactions with 83 widget examples.

## 0.1.3

- Registry items carry `parts`: every exported part with its props (type, required, default, description). The MCP `get_component` returns them, and the docs render them.

## 0.1.2

- Registry: lib modules and hooks are namespaced (`lib/utils`, `hooks/use-mobile`), fixing a collision where `add table` installed the table engine instead of the Table component and the docs page showed no parts.

## 0.1.1

- `init` now edits Vite's template `tsconfig` (JSON with comments) and adds the alias and Tailwind plugin to `vite.config.ts`.

## 0.1.0

First release: the shadcn/ui set on Ark UI, the data primitives (data table engine, data grid, kanban, gantt, scheduler, node graph, canvas, query builder, rich text editor, activity feed, comment thread, chat, tree select, cascader, transfer list, virtual list), shared infrastructure (controllable state, live region, hotkeys, history), the CLI, and the MCP server.
