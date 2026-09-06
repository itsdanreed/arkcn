# CLI

Run it with `npx @multicomma/arkcn <command>`. The registry is bundled inside the package, so every CLI version installs a matching set of components and works offline.

## init

```bash
npx @multicomma/arkcn init [--yes] [--alias @] [--dir src] [--css src/index.css] [--no-install]
```

Bootstraps the project: config file, `lib/utils`, base styles, alias, base packages. See [Installation](/arkcn/docs/installation). Re-running it refreshes the base styles in place; they live between `/* arkcn:base */` markers in your stylesheet.

## add

```bash
npx @multicomma/arkcn add <name...> [--all] [--overwrite] [--yes] [--no-install]
```

Copies each component and **everything it imports**: other components, `lib` modules, hooks. Imports are rewritten to your alias and directories. Components with their own CSS (the rich text editor, for example) get their block appended to your stylesheet between `/* arkcn:component <name> */` markers.

Files you have edited are kept unless you pass `--overwrite`. Packages the files need are installed with your package manager (npm, pnpm, yarn, and bun are detected from the lockfile); `--no-install` prints them instead.

```bash
npx @multicomma/arkcn add data-grid kanban tree-select
npx @multicomma/arkcn add --all
```

## list

```bash
npx @multicomma/arkcn list [name...] [--type ui|lib|hook|all] [--docs]
```

Shows the registry with an `installed` marker for what your project already has. `list data-grid --docs` prints the full reference for one item.

## diff

```bash
npx @multicomma/arkcn diff [name...] [--verbose]
```

Reports which installed files differ from the registry version, with a line diff under `--verbose`. Use it before `add --overwrite` to see what you would lose.

## mcp

```bash
npx @multicomma/arkcn mcp
```

Starts the [MCP server](/arkcn/docs/mcp) over stdio.

## A hosted registry

The same registry is committed to the GitHub repository. Pass a URL or directory to read components newer than your CLI:

```bash
npx @multicomma/arkcn add kanban --registry https://raw.githubusercontent.com/itsdanreed/arkcn/main/registry
export ARKCN_REGISTRY=https://raw.githubusercontent.com/itsdanreed/arkcn/main/registry
```

## Configuration

`arkcn.json` in your project root:

```json
{
  "alias": "@",
  "srcDir": "src",
  "componentsDir": "src/components/ui",
  "libDir": "src/lib",
  "hooksDir": "src/hooks",
  "css": "src/index.css"
}
```
