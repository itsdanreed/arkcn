# arkcn

Composable UI components for React web and Expo / React Native, with a copy-into-your-project CLI and MCP server.
The web collection uses [Ark UI](https://ark-ui.com) and Tailwind v4. Native components use React Native primitives
and semantic theme tokens.

## Workspace layout

Like [Ark UI's repository](https://github.com/chakra-ui/ark), each renderer has its own package and dependency boundary.
The root is a private npm workspace; `docs/` is the documentation app.

| Directory | Package | Responsibility |
| --- | --- | --- |
| `packages/react` | `@multicomma/arkcn-react` | Existing React DOM components, hooks, and Tailwind styles |
| `packages/react-native` | `@multicomma/arkcn-react-native` | Native components and theme for Expo and React Native |
| `packages/core` | `@multicomma/arkcn-core` | Shared design tokens, time helpers, table contracts, row layout, drop intents |
| `packages/react-shared` | `@multicomma/arkcn-react-shared` | DOM-free React state hooks and table engine, shared by web and native |
| `packages/registry` | `@multicomma/arkcn-registry` | Generated catalogs, registry reader, and shared installation operations |
| `packages/cli` | `@multicomma/arkcn` | `arkcn` command, prompts, and package installation |
| `packages/mcp` | `@multicomma/arkcn-mcp` | Stdio MCP server |

Dependencies flow from renderers to shared packages. `core` has no React dependency. Neither shared package imports
DOM APIs. CLI and MCP depend on the registry, which embeds component source and has no UI runtime dependencies.
Future framework renderers belong beside `react` and `react-native`; framework-specific hooks stay out of `core`.

## Install components

```bash
# React web
npx @multicomma/arkcn init --framework react
npx @multicomma/arkcn add button card dialog data-grid

# Run inside an existing Expo or React Native app
npx @multicomma/arkcn init --framework react-native
npx @multicomma/arkcn add button card input textarea badge separator spinner skeleton
npx @multicomma/arkcn add checkbox switch radio-group tabs collapsible progress alert avatar toggle toggle-group accordion
```

`init` detects Expo / React Native when no framework is specified, and saves the choice in `arkcn.json`.
Existing configs without `framework` continue to mean React web. The framework cannot be switched in place because
both renderers use the same component filenames. Use separate projects/directories for separate renderers.

Web init writes utilities, merges Tailwind v4 styles, checks aliases, and installs web dependencies. Native init
writes theme helpers and checks aliases; it does not write CSS or install Ark UI, Tailwind, or React DOM. Expo
projects use `expo install` when additional native dependencies are needed. Bare React Native apps must configure
their bundler to resolve the chosen alias; Expo reads TypeScript path aliases.

`add` copies the component and its helper dependencies into your project. Imports are rewritten for your alias
and directory choices. Shared workspace modules are embedded as editable source, so copied components don't
require arkcn packages. Local changes are kept unless `--overwrite` is passed.

```bash
npx @multicomma/arkcn list
npx @multicomma/arkcn list button --docs
npx @multicomma/arkcn diff --verbose
npx @multicomma/arkcn add --all --no-install
```

Native currently provides **23 components: Button, Card, Input, Textarea, Badge, Separator, Spinner, Skeleton, Checkbox, Switch, Radio Group, Tabs, Collapsible, Progress, Alert, Avatar, Toggle, Toggle Group, Accordion, Input Group, Button Group, Label, and Aspect Ratio**, plus shared
logic. It does not yet provide the full web catalog. Unported names fail explicitly. Native APIs use `onPress`,
`onChangeText`, `style`, and accessibility props; web `asChild`, CSS classes, and DOM events do not apply.

## Import packages directly

```tsx
// Web
import { Button } from "@multicomma/arkcn-react/ui/button"
import "@multicomma/arkcn-react/styles.css"

// Native
import { Button, Card, NativeThemeProvider } from "@multicomma/arkcn-react-native"
```

These packages export TypeScript source for consumer bundlers, as the original package did. Internal imports are
relative or explicit package imports: consumers no longer need an `@/` alias to use package exports. Web consumers
must import Tailwind first and add `@source "../node_modules/@multicomma/arkcn-react/src"` to their stylesheet
(adjust the relative path). Heavy web integrations remain optional peers.

**Migration:** `@multicomma/arkcn` is now the CLI package. Change existing direct `@multicomma/arkcn/ui/*`, `lib/*`,
`hooks/*`, `src/*`, and `styles.css` imports to `@multicomma/arkcn-react/...`. Update any aliases or Tailwind source
paths pointing to the old package. Existing CLI commands and copied components keep working. Package names here
become available externally only after the workspace packages are published.

## Registries and MCP

`npm run build:registry` generates `packages/registry/registry/react` and `packages/registry/registry/react-native`.
Each contains `index.json`, `base.css`, and `items/<name>.json`. Catalogs include framework metadata; the CLI and
MCP reject a registry that doesn't match the target project. Generated files are committed and shipped in the
registry package, so installation works offline and uses the same version as the CLI.

```bash
npx @multicomma/arkcn add kanban --registry https://raw.githubusercontent.com/itsdanreed/arkcn/main/packages/registry/registry/react
npx @multicomma/arkcn mcp --framework react-native
```

Use `ARKCN_REGISTRY` and `ARKCN_FRAMEWORK` for environment configuration. `arkcn-mcp` is also available from the
standalone `@multicomma/arkcn-mcp` package. Its default framework is `react`.

```json
{
  "mcpServers": {
    "arkcn-native": {
      "command": "npx",
      "args": ["-y", "@multicomma/arkcn", "mcp", "--framework", "react-native"]
    }
  }
}
```

Tools: `list_components`, `search_components`, `get_component`, `get_docs`, `plan_install`, and `add_components`.
MCP reports required dependencies but does not run a package manager.

## Develop

```bash
npm install
npm run check
npm run docs:dev
npm run docs:build
npm run typecheck --workspace @multicomma/arkcn-react-native
```

`check` builds both registries, checks every TypeScript workspace, runs lint/format and web API checks, verifies
web/native CLI installs and package tarballs, exercises MCP, and tests native component behavior with host doubles.
The docs header switches frameworks and keeps the catalog, examples, source, and commands in sync. Shared design
tokens generate web CSS and native colors; load Geist in native apps for matching typography (see the native
theming guide). The docs include an interactive native preview via React Native Web at `/arkcn/docs/react-native`; it is not a
substitute for device testing. With the dev server running, `/arkcn/parity.html` compares all 23 examples side by side, including light/dark themes and reduced motion. Build output remains `docs/dist`.

Before extending native coverage, run the component state audit at `/arkcn/state-audit.html` with the dev server running.
The visual baseline is the [Nova style](https://github.com/shadcn-ui/ui/blob/30a58d4498f270af1c1e981a7d78a15cf5740841/apps/v4/registry/styles/style-nova.css)
and its [component structure](https://github.com/shadcn-ui/ui/tree/30a58d4498f270af1c1e981a7d78a15cf5740841/apps/v4/registry/bases/base/ui).
Keep Ark's APIs while mapping its state attributes to the same styling. Do not mix in the legacy New York defaults.

For the upstream comparison, run `npm run audit:prepare`, then
`npm install --prefix docs/.style-audit --ignore-scripts`, and open `/arkcn/catalog-audit.html` on the docs dev server.
The left frame renders actual pinned shadcn source with its Nova recipes and neutral theme; the right renders arkcn.
The reference has isolated dependencies and CSS. Example adapters translate API composition, never component styles.
There are 59 direct counterparts; the other 57 families require related-pattern review and are marked accordingly.
See [the audit record](docs/style-audit.md) for coverage, fixes, and remaining differences. The web/native parity page
is a separate check and does not establish agreement with shadcn.

The state fixture covers all Button variants, disabled actions, invalid and expanded buttons, grouped actions,
hidden form fields, trailing text, small and vertical groups, inputs, checked/mixed controls, invalid controls,
selected toggles, and both tab styles. Check both themes, keyboard focus and disabled tab skipping, pointer
hover/press, and reduced motion. Button Group groups actions; Toggle Group owns persistent selection. Outlined
buttons already supply their dividers; use Separator between filled buttons. `/arkcn/parity.html` covers the full
23-component example set. A passing source/type check alone does not establish visual parity.

The [native validation app](examples/native/README.md) installs those same examples through the CLI into a standalone Expo project. It loads Geist and supports both themes and reduced motion for iOS/Android runtime checks. Its separate lockfile preserves Expo's SDK-compatible native dependencies.

Publish explicitly from a workspace, never the private root. Release shared packages and the registry before
their dependents (core, react-shared, registry → react, react-native, mcp → cli), keeping internal dependency
versions aligned. Each publish runs the repository checks. No publish is performed by the development scripts.
