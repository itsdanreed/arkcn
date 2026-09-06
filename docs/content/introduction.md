# Introduction

arkcn is a set of React components in the shadcn/ui style, rebuilt on [Ark UI](https://ark-ui.com) instead of Radix, plus the data-heavy primitives most products end up writing themselves: an editable data grid, kanban board, gantt timeline, scheduler, node graph, rich text editor, query builder, tree select, cascader, transfer list, and a virtual list.

It is not a component library you install. It is a collection of source files you copy into your project with a CLI, exactly like shadcn/ui. Once added, the code is yours: read it, restyle it, change it.

## Why Ark UI

Ark UI is a headless component library built on state machines. Every component exposes its state through `data-*` attributes (`data-state`, `data-open`, `data-highlighted`, `data-disabled`, `data-placement`, and so on), which makes Tailwind styling declarative and keeps the parts composable. arkcn keeps Ark's anatomy: where Ark has a `Positioner`, a `Control`, an `ItemGroup`, or a `HiddenInput`, the part is exported rather than folded away.

## What you get

- **The shadcn set**, part for part, with the same names and props wherever Ark supports them.
- **Data primitives** designed to be compositional and data-agnostic: the consumer owns the data and receives intents (`onCardMove`, `onCellChange`, `onConnect`, `onEventChange`) instead of the component mutating state.
- **Shared infrastructure**: a controllable-state hook, a live-region announcer, a hotkey registry with a shortcuts dialog, an undo/redo history hook, and a dependency-free headless table engine.
- **A CLI** that bootstraps a project and copies components with everything they import, and an **MCP server** so coding agents can browse and install components.

## Principles

- **Every part is exported.** No "smart" wrapper that hides sub-parts. Every part carries a `data-slot` attribute.
- **Triggers are polymorphic.** Anything clickable accepts `asChild` and renders your element unchanged.
- **Styling is data-driven.** Variants use `class-variance-authority`; state comes from Ark's data attributes.
- **Keyboard first.** Grids, boards, timelines, and graphs are fully operable from the keyboard, with a live region announcing what happened.
