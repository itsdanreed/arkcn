// Generates registry/ from src: one item per component, lib module, and hook, with file
// contents, resolved external dependencies (versions from package.json peers), toolkit
// dependencies (imports through the "@/" alias), CSS fragments (blocks between
// "/* @registry:component <name> */" and "/* @registry:end */" in src/styles/tide.css),
// and a short description (first block comment or JSDoc of the file, or the CLAUDE.md heading).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const versions = { ...pkg.devDependencies, ...pkg.peerDependencies }
const optionalPeers = new Set(Object.keys(pkg.peerDependenciesMeta ?? {}))
const requiredPeers = Object.keys(pkg.peerDependencies).filter((d) => !optionalPeers.has(d))

const sources = [
  { dir: "src/components/ui", type: "ui", target: "components/ui", ext: ".tsx" },
  { dir: "src/lib", type: "lib", target: "lib", ext: ".ts" },
  { dir: "src/hooks", type: "hook", target: "hooks", ext: ".ts" },
]

const packageOf = (spec) => {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/")
  return spec.split("/")[0]
}

const docs = existsSync(join(root, "CLAUDE.md")) ? readFileSync(join(root, "CLAUDE.md"), "utf8") : ""
const docSections = new Map()
for (const section of docs.split(/(?=^## )/m)) {
  const heading = section.split("\n")[0].replace(/^## /, "").trim()
  if (heading) docSections.set(heading.toLowerCase(), section.trim())
}
const docsFor = (name) => {
  const pretty = name.replace(/-/g, " ")
  for (const [heading, text] of docSections) {
    if (heading === pretty || heading.startsWith(pretty + " ") || heading.includes(`\`${name}`)) return text
  }
  // Sections that mention the file explicitly.
  for (const [, text] of docSections) if (text.includes(`${name}.tsx`) || text.includes(`${name}.ts\``)) return text
  return undefined
}

const describe = (content, name) => {
  const m = content.match(/^\s*(?:"use client"\s*)?(?:import[^\n]*\n)*\s*\/\*\*?\s*([\s\S]*?)\*\//)
  if (m)
    return m[1]
      .replace(/^\s*\*\s?/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240)
  const doc = docsFor(name)
  if (doc) {
    const text = doc.split("\n").slice(1).join(" ").replace(/\s+/g, " ").trim()
    const cut = text.slice(0, 240)
    const end = cut.lastIndexOf(". ")
    return end > 60 ? cut.slice(0, end + 1) : cut
  }
  return ""
}

const css = readFileSync(join(root, "src/styles/tide.css"), "utf8")
const fragments = new Map()
let base = ""
let cursor = 0
const marker = /\/\* @registry:component ([a-z0-9-]+) \*\/\n([\s\S]*?)\/\* @registry:end \*\/\n?/g
for (const m of css.matchAll(marker)) {
  base += css.slice(cursor, m.index)
  fragments.set(m[1], m[2].trim() + "\n")
  cursor = m.index + m[0].length
}
base += css.slice(cursor)
base = base.replace(/^\/\*[\s\S]*?\*\/\n/, "").trim() + "\n"

const items = []
for (const source of sources) {
  const dir = join(root, source.dir)
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(source.ext))
    .sort()) {
    const name = file.slice(0, -source.ext.length)
    const content = readFileSync(join(dir, file), "utf8")
    const registryDependencies = new Set()
    const dependencies = new Set()
    for (const m of content.matchAll(/from\s+"([^"]+)"/g)) {
      const spec = m[1]
      if (spec.startsWith("@/")) {
        const target = spec
          .replace(/^@\//, "")
          .replace(/^components\/ui\//, "")
          .replace(/^(lib|hooks)\//, "")
        if (target !== name) registryDependencies.add(target)
      } else if (!spec.startsWith(".")) {
        const dep = packageOf(spec)
        if (dep !== "react" && dep !== "react-dom") dependencies.add(dep)
      }
    }
    items.push({
      name,
      type: source.type,
      description: describe(content, name),
      dependencies: Object.fromEntries([...dependencies].sort().map((d) => [d, versions[d] ?? "latest"])),
      registryDependencies: [...registryDependencies].sort(),
      files: [{ path: `${source.target}/${file}`, content }],
      css: fragments.get(name),
      docs: docsFor(name),
    })
  }
}

const out = join(root, "registry")
rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, "items"), { recursive: true })
for (const item of items) writeFileSync(join(out, "items", `${item.name}.json`), JSON.stringify(item, null, 2) + "\n")
writeFileSync(join(out, "base.css"), base)
writeFileSync(
  join(out, "index.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      baseDependencies: Object.fromEntries(requiredPeers.map((d) => [d, versions[d]])),
      items: items.map(({ name, type, description, dependencies, registryDependencies, files, css }) => ({
        name,
        type,
        description,
        dependencies: Object.keys(dependencies),
        registryDependencies,
        files: files.map((f) => f.path),
        css: !!css,
      })),
    },
    null,
    2
  ) + "\n"
)
const unusedFragments = [...fragments.keys()].filter((n) => !items.some((i) => i.name === n))
if (unusedFragments.length) {
  console.error(`build-registry: CSS fragments without a component: ${unusedFragments.join(", ")}`)
  process.exit(1)
}
console.log(`build-registry: ${items.length} items, ${fragments.size} css fragment(s)`)
