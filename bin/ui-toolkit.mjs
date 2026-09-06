#!/usr/bin/env node
import { parseArgs } from "node:util"
import { add, diff, init, list } from "../cli/commands.mjs"
import { createRegistry } from "../cli/registry.mjs"
import { c, fail, log } from "../cli/ui.mjs"

const help = `${c.bold("ui-toolkit")} - copy Ark UI components into your project

${c.bold("Usage")}
  npx @itsdanreed/ui-toolkit init [--yes] [--alias @] [--css src/index.css] [--dir src] [--no-install]
  npx @itsdanreed/ui-toolkit add <name...> [--all] [--overwrite] [--yes] [--no-install]
  npx @itsdanreed/ui-toolkit list [name...] [--type ui|lib|hook|all] [--docs]
  npx @itsdanreed/ui-toolkit diff [name...] [--verbose]

${c.bold("Commands")}
  init   Write ui-toolkit.json, lib/utils, the base styles, check the "@/" alias, install base deps
  add    Copy components (and everything they import) into your project, merge their styles, install deps
  list   Show the registry, or one item with --docs
  diff   Show which installed files were changed locally since they were added

${c.bold("Options")}
  --registry <url|dir>  Read the registry from a URL or directory instead of the bundled copy
                        (also UI_TOOLKIT_REGISTRY), e.g. the GitHub raw URL of registry/
  --cwd <dir>           Project directory (default: current)
`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  allowNegative: true,
  options: {
    help: { type: "boolean", short: "h" },
    yes: { type: "boolean", short: "y" },
    all: { type: "boolean" },
    overwrite: { type: "boolean" },
    install: { type: "boolean", default: true },
    verbose: { type: "boolean", short: "v" },
    docs: { type: "boolean" },
    alias: { type: "string" },
    css: { type: "string" },
    dir: { type: "string" },
    type: { type: "string" },
    cwd: { type: "string" },
    registry: { type: "string" },
  },
})

const [command, ...names] = positionals
const cwd = values.cwd ?? process.cwd()
const registry = createRegistry(values.registry ?? process.env.UI_TOOLKIT_REGISTRY)

try {
  switch (command) {
    case "init":
      await init(cwd, registry, values)
      break
    case "add":
      await add(cwd, registry, names, values)
      break
    case "list":
      await list(cwd, registry, names, values)
      break
    case "diff":
      await diff(cwd, registry, names, values)
      break
    default:
      log(help)
      if (command && !values.help) fail(`Unknown command: ${command}`)
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
