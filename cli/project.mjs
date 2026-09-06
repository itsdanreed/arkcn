import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { spawnSync } from "node:child_process"

export const CONFIG_FILE = "arkcn.json"

export const defaultConfig = {
  alias: "@",
  /** What the alias points at; component dirs live under it. */
  srcDir: "src",
  componentsDir: "src/components/ui",
  libDir: "src/lib",
  hooksDir: "src/hooks",
  css: "src/index.css",
}

export function readConfig(cwd) {
  const file = join(cwd, CONFIG_FILE)
  if (!existsSync(file)) return null
  return { ...defaultConfig, ...JSON.parse(readFileSync(file, "utf8")) }
}

export function writeConfig(cwd, config) {
  writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + "\n")
}

export function detectPackageManager(cwd) {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn"
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun"
  return "npm"
}

export function readPackageJson(cwd) {
  const file = join(cwd, "package.json")
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, "utf8"))
}

export function installedVersion(cwd, dep) {
  const pkg = readPackageJson(cwd)
  return pkg?.dependencies?.[dep] ?? pkg?.devDependencies?.[dep] ?? null
}

/** Target path inside the project for a registry file path like "components/ui/button.tsx". */
export function targetPath(config, registryPath) {
  if (registryPath.startsWith("components/ui/"))
    return join(config.componentsDir, registryPath.slice("components/ui/".length))
  if (registryPath.startsWith("lib/")) return join(config.libDir, registryPath.slice("lib/".length))
  if (registryPath.startsWith("hooks/")) return join(config.hooksDir, registryPath.slice("hooks/".length))
  return registryPath
}

/** Rewrite "@/components/ui/x", "@/lib/x", "@/hooks/x" imports to the project's alias and dirs. */
export function rewriteImports(content, config) {
  const alias = config.alias.replace(/\/$/, "")
  const dirs = { "components/ui": config.componentsDir, lib: config.libDir, hooks: config.hooksDir }
  const rootPrefix = new RegExp(`^${config.srcDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`)
  return content.replace(/from "@\/(components\/ui|lib|hooks)\/([^"]+)"/g, (_, kind, rest) => {
    const dir = dirs[kind].replace(rootPrefix, "")
    return `from "${alias}/${dir}/${rest}"`
  })
}

export function writeProjectFile(cwd, rel, content) {
  const file = join(cwd, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
  return relative(cwd, file)
}

export function readProjectFile(cwd, rel) {
  const file = join(cwd, rel)
  return existsSync(file) ? readFileSync(file, "utf8") : null
}

const BASE_START = "/* arkcn:base */"
const BASE_END = "/* arkcn:base:end */"
const fragmentStart = (name) => `/* arkcn:component ${name} */`
const fragmentEnd = (name) => `/* arkcn:component ${name}:end */`

function replaceBlock(css, start, end, block) {
  const i = css.indexOf(start)
  const j = css.indexOf(end)
  if (i >= 0 && j > i) {
    const current = css.slice(i, j + end.length + 1)
    if (current === block) return { css, result: "unchanged" }
    return { css: css.slice(0, i) + block + css.slice(j + end.length).replace(/^\n/, ""), result: "updated" }
  }
  return { css: css.trimEnd() + "\n\n" + block, result: "appended" }
}

/** Insert or replace the base block; creates the stylesheet (with the tailwind import) when missing. */
export function mergeBaseCss(cwd, config, baseCss) {
  const block = `${BASE_START}\n${baseCss.trim()}\n${BASE_END}\n`
  let css = readProjectFile(cwd, config.css)
  if (css === null) {
    writeProjectFile(cwd, config.css, `@import "tailwindcss";\n\n${block}`)
    return "created"
  }
  if (!/@import\s+"tailwindcss"/.test(css)) css = `@import "tailwindcss";\n` + css
  const merged = replaceBlock(css, BASE_START, BASE_END, block)
  if (merged.result !== "unchanged") writeProjectFile(cwd, config.css, merged.css)
  return merged.result
}

export function mergeComponentCss(cwd, config, name, fragment) {
  const css = readProjectFile(cwd, config.css) ?? `@import "tailwindcss";\n`
  const block = `${fragmentStart(name)}\n${fragment.trim()}\n${fragmentEnd(name)}\n`
  const merged = replaceBlock(css, fragmentStart(name), fragmentEnd(name), block)
  if (merged.result !== "unchanged") writeProjectFile(cwd, config.css, merged.css)
  return merged.result
}

export function installDependencies(cwd, deps) {
  if (deps.length === 0) return { ok: true, skipped: true }
  const pm = detectPackageManager(cwd)
  const args = pm === "npm" ? ["install", ...deps] : ["add", ...deps]
  const result = spawnSync(pm, args, { cwd, stdio: "inherit" })
  return { ok: result.status === 0, pm, args }
}

/**
 * Ensure tsconfig paths has "<alias>/*": ["./<srcDir>/*"]. Works on JSON with comments (Vite's
 * templates) by inserting text instead of re-serialising. Returns "ok" | "added" | "manual".
 */
export function ensureTsconfigAlias(cwd, alias, srcDir = "src") {
  for (const name of ["tsconfig.app.json", "tsconfig.json"]) {
    const file = join(cwd, name)
    if (!existsSync(file)) continue
    const raw = readFileSync(file, "utf8")
    const key = `"${alias}/*"`
    if (raw.includes(key)) return "ok"
    const entry = `${key}: ["./${srcDir}/*"]`
    const pathsMatch = raw.match(/"paths"\s*:\s*\{/)
    if (pathsMatch) {
      const at = pathsMatch.index + pathsMatch[0].length
      const rest = raw.slice(at)
      const empty = /^\s*\}/.test(rest)
      writeFileSync(file, raw.slice(0, at) + `\n      ${entry}${empty ? "" : ","}` + rest)
      return "added"
    }
    const optionsMatch = raw.match(/"compilerOptions"\s*:\s*\{/)
    if (!optionsMatch) continue
    const at = optionsMatch.index + optionsMatch[0].length
    const rest = raw.slice(at)
    const empty = /^\s*\}/.test(rest)
    writeFileSync(file, raw.slice(0, at) + `\n    "paths": {\n      ${entry}\n    }${empty ? "" : ","}` + rest)
    return "added"
  }
  return "manual"
}

/**
 * Ensure a Vite config has the "@" alias and the Tailwind plugin. Returns what was added.
 * Next.js reads tsconfig paths on its own, so it only needs the tsconfig step.
 */
export function ensureViteConfig(cwd, alias, srcDir = "src") {
  const name = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].find((n) =>
    existsSync(join(cwd, n))
  )
  if (!name) return { file: null, added: [] }
  const file = join(cwd, name)
  let raw = readFileSync(file, "utf8")
  const added = []
  const hasAlias = raw.includes(`"${alias}"`) || raw.includes(`'${alias}'`) || raw.includes("tsconfigPaths")
  const hasTailwind = raw.includes("@tailwindcss/vite")
  const config = raw.match(/defineConfig\(\s*\{/)
  if (!config) return { file: name, added, manual: !hasAlias || !hasTailwind }
  if (!hasTailwind) {
    raw = `import tailwindcss from "@tailwindcss/vite"\n` + raw
    const plugins = raw.match(/plugins\s*:\s*\[/)
    if (plugins) {
      const at = plugins.index + plugins[0].length
      raw = raw.slice(0, at) + "tailwindcss(), " + raw.slice(at)
    } else {
      const m = raw.match(/defineConfig\(\s*\{/)
      raw = raw.slice(0, m.index + m[0].length) + "\n  plugins: [tailwindcss()]," + raw.slice(m.index + m[0].length)
    }
    added.push("tailwind plugin")
  }
  if (!hasAlias) {
    if (!/from ["']node:path["']|from ["']path["']/.test(raw)) raw = `import path from "node:path"\n` + raw
    const m = raw.match(/defineConfig\(\s*\{/)
    const at = m.index + m[0].length
    raw =
      raw.slice(0, at) +
      `\n  resolve: {\n    alias: { "${alias}": path.resolve(import.meta.dirname, "./${srcDir}") },\n  },` +
      raw.slice(at)
    added.push("alias")
  }
  if (added.length) writeFileSync(file, raw)
  return { file: name, added }
}

export function detectBundlerAlias(cwd, alias) {
  const candidates = [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
    "next.config.ts",
    "next.config.js",
    "next.config.mjs",
  ]
  for (const name of candidates) {
    const file = join(cwd, name)
    if (!existsSync(file)) continue
    const raw = readFileSync(file, "utf8")
    if (name.startsWith("next")) return { file: name, ok: true, framework: "next" }
    const ok = raw.includes(`"${alias}"`) || raw.includes(`'${alias}'`) || raw.includes("tsconfigPaths")
    return { file: name, ok, framework: "vite" }
  }
  return { file: null, ok: false, framework: "unknown" }
}
