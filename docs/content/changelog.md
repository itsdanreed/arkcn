# Changelog

## 0.3.0

- Align private component implementation names with their public parts, such as `CardRoot` and `AccordionItemTrigger`.
- Export named prop aliases alongside component objects, preserving generic item and row types. Remove merged TypeScript namespaces and keep compositional functions private.
- Restore default Switch sizing, notification item layout with `asChild`, and spacing below sidebar submenus.
- Add checks for all 1,202 compositional names and prop exports, plus type-extension regression tests.

## 0.2.0

- Replace flat component exports with namespace APIs such as `Card.Root` and `Accordion.ItemTrigger`. This is a breaking change; compatibility exports are not provided.
- Keep the standalone Button component as `<Button>`, with a `ButtonProps` type.
- Expose Ark parts, contexts, and root providers, and add polymorphism to replaceable DOM parts.
- Add DatePicker, PinInput, Splitter, Fieldset, Listbox, and Toast; move Field and Pagination onto Ark primitives. Retain Embla for Carousel.
- Add ClientOnly, DownloadTrigger, FocusTrap, Frame, Highlight, Portal, and Presence.
- Update documentation and registry metadata, audit all 124 documentation routes, and add API coverage and composition checks.

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
