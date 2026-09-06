import { existsSync } from "node:fs"
import { join } from "node:path"
import {
  CONFIG_FILE,
  defaultConfig,
  detectBundlerAlias,
  detectPackageManager,
  ensureTsconfigAlias,
  installDependencies,
  installedVersion,
  mergeBaseCss,
  mergeComponentCss,
  readConfig,
  readPackageJson,
  readProjectFile,
  rewriteImports,
  targetPath,
  writeConfig,
  writeProjectFile,
} from "./project.mjs"
import { c, confirm, fail, log, ok, table, warn } from "./ui.mjs"

/** Write an item's files. Returns what was written and what was kept. */
export function writeItem(cwd, config, item, { overwrite }) {
  const written = []
  const kept = []
  for (const file of item.files) {
    const rel = targetPath(config, file.path)
    const content = rewriteImports(file.content, config)
    const current = readProjectFile(cwd, rel)
    if (current === content) continue
    if (current !== null && !overwrite) {
      kept.push(rel)
      continue
    }
    writeProjectFile(cwd, rel, content)
    written.push(rel)
  }
  return { written, kept }
}

/** Files that exist locally and differ from the registry version. */
export function findConflicts(cwd, config, items) {
  const conflicts = []
  for (const item of items)
    for (const file of item.files) {
      const rel = targetPath(config, file.path)
      const current = readProjectFile(cwd, rel)
      if (current !== null && current !== rewriteImports(file.content, config)) conflicts.push(rel)
    }
  return conflicts
}

/** Packages an item set needs that the project does not have yet. */
export function missingDependencies(cwd, items) {
  const deps = new Map()
  for (const item of items)
    for (const [dep, version] of Object.entries(item.dependencies))
      if (!installedVersion(cwd, dep)) deps.set(dep, version)
  return [...deps].map(([dep, version]) => `${dep}@${version}`)
}

/** `init`: config file, utils, base styles, alias check, base dependencies. */
export async function init(cwd, registry, flags) {
  if (!readPackageJson(cwd)) fail(`No package.json in ${cwd}. Run this inside your app.`)
  const existing = readConfig(cwd)
  if (existing && !flags.yes) {
    const again = await confirm(`${CONFIG_FILE} already exists. Re-run init and refresh the base styles?`, {
      fallback: false,
    })
    if (!again) return
  }
  const config = {
    ...defaultConfig,
    ...existing,
    ...(flags.alias ? { alias: flags.alias } : {}),
    ...(flags.css ? { css: flags.css } : {}),
    ...(flags.dir
      ? {
          srcDir: flags.dir,
          componentsDir: `${flags.dir}/components/ui`,
          libDir: `${flags.dir}/lib`,
          hooksDir: `${flags.dir}/hooks`,
        }
      : {}),
  }
  writeConfig(cwd, config)
  ok(`Wrote ${CONFIG_FILE}`)

  const tailwind = installedVersion(cwd, "tailwindcss")
  if (!tailwind) warn("tailwindcss is not in package.json; it will be installed (v4 is required).")
  else if (!/(\^|~)?4\./.test(tailwind)) warn(`tailwindcss ${tailwind} found; the toolkit needs v4.`)

  const alias = ensureTsconfigAlias(cwd, config.alias, config.srcDir)
  if (alias === "added") ok(`Added "${config.alias}/*" -> "./${config.srcDir}/*" to tsconfig paths`)
  else if (alias === "ok") ok(`tsconfig already maps "${config.alias}/*"`)
  else warn(`Add "paths": { "${config.alias}/*": ["./${config.srcDir}/*"] } to your tsconfig compilerOptions.`)
  const bundler = detectBundlerAlias(cwd, config.alias)
  if (bundler.framework === "vite" && !bundler.ok)
    warn(
      `Add the alias to ${bundler.file}: resolve.alias { "${config.alias}": path.resolve(__dirname, "./${config.srcDir}") }`
    )

  const { items } = await registry.closure(["utils"])
  for (const item of items) writeItem(cwd, config, item, { overwrite: false })
  ok(`Wrote ${targetPath(config, "lib/utils.ts")}`)

  const result = mergeBaseCss(cwd, config, await registry.baseCss())
  const verb = {
    created: "Created",
    updated: "Updated base styles in",
    appended: "Appended base styles to",
    unchanged: "Base styles already current in",
  }
  ok(`${verb[result]} ${config.css}`)

  const index = await registry.index()
  const deps = Object.entries(index.baseDependencies)
    .filter(([dep]) => !installedVersion(cwd, dep))
    .map(([dep, version]) => `${dep}@${version}`)
  await install(cwd, deps, flags)
  log(`\nNext: ${c.cyan("npx @itsdanreed/ui-toolkit add button card dialog")}`)
}

async function install(cwd, deps, flags) {
  if (deps.length === 0) return ok("No new dependencies")
  if (flags.install === false) return log(`${c.dim("Skipped install. Needed:")} ${deps.join(" ")}`)
  log(`${c.dim(`Installing with ${detectPackageManager(cwd)}:`)} ${deps.join(" ")}`)
  const res = installDependencies(cwd, deps)
  if (!res.ok) fail("Install failed. Install the packages above and re-run.")
}

/** `add`: closure of components, files, CSS fragments, dependencies. */
export async function add(cwd, registry, names, flags) {
  const config = readConfig(cwd)
  if (!config) fail(`No ${CONFIG_FILE}. Run ${c.cyan("npx @itsdanreed/ui-toolkit init")} first.`)
  const index = await registry.index()
  const wanted = flags.all ? index.items.filter((i) => i.type === "ui").map((i) => i.name) : names
  if (wanted.length === 0) fail("Nothing to add. Pass component names or --all.")
  const { items, missing } = await registry.closure(wanted)
  if (missing.length) fail(`Unknown: ${missing.join(", ")}. See ${c.cyan("npx @itsdanreed/ui-toolkit list")}.`)

  let overwrite = !!flags.overwrite
  const conflicts = findConflicts(cwd, config, items)
  if (conflicts.length && !overwrite) {
    warn(`These files exist and differ from the registry:\n  ${conflicts.join("\n  ")}`)
    overwrite = await confirm("Overwrite them?", { yes: flags.yes, fallback: false })
    if (!overwrite) log(c.dim("Keeping your versions; only new files will be written."))
  }

  let cssChanges = 0
  for (const item of items) {
    const { written, kept } = writeItem(cwd, config, item, { overwrite })
    for (const rel of written) ok(`${item.name} -> ${rel}`)
    for (const rel of kept) log(`${c.dim("kept")} ${rel}`)
    if (item.css) {
      const r = mergeComponentCss(cwd, config, item.name, item.css)
      if (r !== "unchanged") {
        cssChanges++
        ok(`${item.name} styles ${r === "updated" ? "updated in" : "appended to"} ${config.css}`)
      }
    }
  }
  await install(cwd, missingDependencies(cwd, items), flags)
  const uiCount = items.filter((i) => i.type === "ui").length
  log(
    `\n${c.bold(`${uiCount} component(s), ${items.length - uiCount} helper(s)${cssChanges ? `, ${cssChanges} style block(s)` : ""}`)}`
  )
}

/** `list`: everything in the registry, or one item in detail. */
export async function list(cwd, registry, names, flags) {
  const index = await registry.index()
  const config = readConfig(cwd)
  if (names.length) {
    for (const name of names) {
      const item = await registry.item(name)
      if (!item) return fail(`Unknown component: ${name}`)
      log(`${c.bold(item.name)} ${c.dim(`(${item.type})`)}\n${item.description}\n`)
      log(`${c.dim("files:")} ${item.files.map((f) => f.path).join(", ")}`)
      log(`${c.dim("needs:")} ${item.registryDependencies.join(", ") || "-"}`)
      log(`${c.dim("packages:")} ${Object.keys(item.dependencies).join(", ") || "-"}`)
      if (item.css) log(`${c.dim("styles:")} yes`)
      if (flags.docs && item.docs) log(`\n${item.docs}`)
    }
    return
  }
  const type = flags.type ?? "ui"
  const rows = index.items
    .filter((i) => type === "all" || i.type === type)
    .map((i) => {
      const installed = config && i.files.every((f) => existsSync(join(cwd, targetPath(config, f))))
      return [i.name, i.type, installed ? c.green("installed") : "", i.description.slice(0, 70)]
    })
  table(rows, ["name", "type", "", "description"])
  log(c.dim(`\n${rows.length} item(s) from ${registry.source}. \`list <name> --docs\` prints the documentation.`))
}

/** `diff`: compare installed files with the registry. */
export async function diff(cwd, registry, names, flags) {
  const config = readConfig(cwd)
  if (!config) fail(`No ${CONFIG_FILE}. Run init first.`)
  const index = await registry.index()
  const targets = names.length ? names : index.items.map((i) => i.name)
  let changed = 0
  for (const name of targets) {
    const item = await registry.item(name)
    if (!item) return fail(`Unknown component: ${name}`)
    for (const file of item.files) {
      const rel = targetPath(config, file.path)
      const current = readProjectFile(cwd, rel)
      if (current === null) {
        if (names.length) log(`${c.dim("missing")} ${rel}`)
        continue
      }
      const expected = rewriteImports(file.content, config)
      if (current === expected) {
        if (names.length) log(`${c.green("same")}    ${rel}`)
        continue
      }
      changed++
      log(`${c.yellow("changed")} ${rel}`)
      if (flags.verbose) log(lineDiff(current, expected))
    }
  }
  if (!changed) ok("Installed files match the registry")
  else log(c.dim(`\n${changed} file(s) differ. \`add <name> --overwrite\` replaces them with the registry version.`))
}

/** Minimal LCS line diff (files are small). */
export function lineDiff(current, expected) {
  const a = current.split("\n")
  const b = expected.split("\n")
  const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  let i = 0
  let j = 0
  const out = []
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(c.red(`- ${a[i++]}`))
    else out.push(c.green(`+ ${b[j++]}`))
  }
  while (i < a.length) out.push(c.red(`- ${a[i++]}`))
  while (j < b.length) out.push(c.green(`+ ${b[j++]}`))
  return out.join("\n")
}
