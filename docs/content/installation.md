# Installation

arkcn needs React 19, Tailwind CSS v4, and TypeScript. The CLI handles the rest.

## Vite

Create the app and add Tailwind, then let `init` configure everything.

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install tailwindcss @tailwindcss/vite
npx @multicomma/arkcn init
```

`init` does the following:

- writes `arkcn.json` with the alias and directories it will use
- adds `"@/*": ["./src/*"]` to your `tsconfig` (comments are preserved)
- adds the `@tailwindcss/vite` plugin and the `@` alias to `vite.config.ts`
- writes `src/lib/utils.ts` (`cn`)
- merges the base styles into `src/index.css` after `@import "tailwindcss"`
- installs the base packages: `@ark-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`, `@tailwindcss/typography`

Then add components:

```bash
npx @multicomma/arkcn add button card dialog
```

## Next.js

Next.js reads `tsconfig` paths on its own, so only the tsconfig and stylesheet steps apply. Point `init` at your global stylesheet:

```bash
npx @multicomma/arkcn init --css app/globals.css
```

Components that use browser APIs carry `"use client"` where needed.

## Manual

If you would rather not run the CLI, copy the files from the [registry](https://github.com/itsdanreed/arkcn/tree/main/registry) on GitHub. Each `registry/items/<name>.json` lists its files, the components it imports, its packages, and an optional CSS block. `registry/base.css` is what `init` merges into your stylesheet.

## Options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--alias` | `@` | Import alias used inside the components |
| `--dir` | `src` | Root the alias points at; components go in `<dir>/components/ui` |
| `--css` | `src/index.css` | Stylesheet to merge base styles into |
| `--no-install` | | Print the packages instead of installing them |
| `--yes` | | Skip prompts |
