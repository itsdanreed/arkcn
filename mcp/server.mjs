import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { add, findConflicts, missingDependencies, writeItem } from "../cli/commands.mjs"
import { createRegistry } from "../cli/registry.mjs"
import { mergeComponentCss, readConfig, readPackageJson, targetPath } from "../cli/project.mjs"

/**
 * MCP server over the same registry the CLI uses. Tools let an agent browse components,
 * read their source and documentation, plan an install, and copy components into a project.
 */
export async function startServer({ registryBase } = {}) {
  const registry = createRegistry(registryBase ?? process.env.UI_TOOLKIT_REGISTRY)
  const index = await registry.index()
  const server = new McpServer({ name: "ui-toolkit", version: index.version })
  const text = (value) => ({
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
  })

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description:
        "Every item in the UI Toolkit registry (name, type, description, dependencies). Types: ui, lib, hook.",
      inputSchema: { type: z.enum(["ui", "lib", "hook", "all"]).default("ui") },
    },
    async ({ type }) => text(index.items.filter((i) => type === "all" || i.type === type))
  )

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description: "Find registry items whose name, description, or documentation mentions the query.",
      inputSchema: { query: z.string().min(1) },
    },
    async ({ query }) => {
      const q = query.toLowerCase()
      const hits = []
      for (const entry of index.items) {
        const item = await registry.item(entry.name)
        const hay = `${item.name} ${item.description} ${item.docs ?? ""}`.toLowerCase()
        if (hay.includes(q)) hits.push({ name: item.name, type: item.type, description: item.description })
      }
      return text(hits)
    }
  )

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description:
        "Full registry item: source files, packages, toolkit dependencies, CSS fragment, and documentation for one component, lib module, or hook.",
      inputSchema: { name: z.string(), includeSource: z.boolean().default(true) },
    },
    async ({ name, includeSource }) => {
      const item = await registry.item(name)
      if (!item) return text({ error: `Unknown item: ${name}` })
      return text(includeSource ? item : { ...item, files: item.files.map((f) => f.path) })
    }
  )

  server.registerTool(
    "get_docs",
    {
      title: "Get documentation",
      description: "The documentation section for a component: anatomy, props, data attributes, keyboard, gotchas.",
      inputSchema: { name: z.string() },
    },
    async ({ name }) => {
      const item = await registry.item(name)
      if (!item) return text({ error: `Unknown item: ${name}` })
      return text(item.docs ?? item.description ?? "No documentation.")
    }
  )

  server.registerTool(
    "plan_install",
    {
      title: "Plan an install",
      description:
        "Without writing anything: which files `add` would write into a project, which exist and differ, and which packages it would install. `cwd` is the project root (must contain ui-toolkit.json).",
      inputSchema: { names: z.array(z.string()).min(1), cwd: z.string() },
    },
    async ({ names, cwd }) => {
      const config = readConfig(cwd)
      if (!config)
        return text({ error: `No ui-toolkit.json in ${cwd}. Run \`npx @itsdanreed/ui-toolkit init\` there first.` })
      const { items, missing } = await registry.closure(names)
      return text({
        missing,
        files: items.flatMap((i) => i.files.map((f) => targetPath(config, f.path))),
        conflicts: findConflicts(cwd, config, items),
        packages: missingDependencies(cwd, items),
        css: items.filter((i) => i.css).map((i) => i.name),
      })
    }
  )

  server.registerTool(
    "add_components",
    {
      title: "Add components",
      description:
        "Copy components (with everything they import) into a project, merge their CSS, and report which packages to install. Does not run the package manager. Existing files that differ are kept unless `overwrite` is true.",
      inputSchema: { names: z.array(z.string()).min(1), cwd: z.string(), overwrite: z.boolean().default(false) },
    },
    async ({ names, cwd, overwrite }) => {
      const config = readConfig(cwd)
      if (!config)
        return text({ error: `No ui-toolkit.json in ${cwd}. Run \`npx @itsdanreed/ui-toolkit init\` there first.` })
      if (!readPackageJson(cwd)) return text({ error: `No package.json in ${cwd}` })
      const { items, missing } = await registry.closure(names)
      if (missing.length) return text({ error: `Unknown: ${missing.join(", ")}` })
      const written = []
      const kept = []
      const css = []
      for (const item of items) {
        const r = writeItem(cwd, config, item, { overwrite })
        written.push(...r.written)
        kept.push(...r.kept)
        if (item.css && mergeComponentCss(cwd, config, item.name, item.css) !== "unchanged") css.push(item.name)
      }
      const packages = missingDependencies(cwd, items)
      return text({
        written,
        kept,
        css,
        packages,
        next: packages.length ? `Install: npm install ${packages.join(" ")}` : "No new packages needed.",
      })
    }
  )

  server.registerResource(
    "registry-index",
    "ui-toolkit://registry/index",
    { title: "Registry index", description: "All UI Toolkit items", mimeType: "application/json" },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(index, null, 2) }],
    })
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
  return server
}

// `add` is re-exported for parity checks; the CLI remains the interactive path.
void add
