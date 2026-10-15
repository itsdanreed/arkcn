// Generate framework catalogs from renderer packages, embedding shared modules for copy installs.
// Relative imports become consumer aliases; web CSS fragments and component docs are included.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createPropsExtractor } from "./props.mjs"
import { dirname, join, resolve, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
for (const framework of ["react", "react-native"]) buildRegistry(framework)

function buildRegistry(framework) {
  const packageRoot = join(root, "packages", framework)
  const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"))
  const versions = { ...pkg.devDependencies, ...pkg.peerDependencies }
  const optionalPeers = new Set(Object.keys(pkg.peerDependenciesMeta ?? {}))
  const requiredPeers = Object.keys(pkg.peerDependencies).filter(
    (d) => !optionalPeers.has(d) && (framework !== "react-native" || !["react", "react-native"].includes(d))
  )
  const sources = [
    { dir: "src/components/ui", type: "ui", target: "components/ui", extensions: [".tsx"], prefix: "" },
    { dir: "src/lib", type: "lib", target: "lib", extensions: [".ts"], prefix: "lib/" },
    { dir: "src/hooks", type: "hook", target: "hooks", extensions: [".ts"], prefix: "hooks/" },
  ]

  // Shared modules are embedded into copyable registry items. The package source keeps
  // real workspace imports, while installed files remain owned by the consumer.
  const sharedPackages = {
    "@multicomma/arkcn-core": "core",
    "@multicomma/arkcn-react-shared": "react-shared",
  }
  const records = []
  for (const source of sources) {
    const dir = join(packageRoot, source.dir)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir).sort()) {
      const ext = source.extensions.find((ext) => file.endsWith(ext))
      if (!ext) continue
      const name = source.prefix + file.slice(0, -ext.length)
      const path = join(dir, file)
      let actualPath = path
      let content = readFileSync(path, "utf8")
      const bridge = content.trim().match(/^export \* from "(@multicomma\/arkcn-(?:core|react-shared))\/([^"/]+)"$/)
      if (bridge) {
        actualPath = join(root, "packages", sharedPackages[bridge[1]], "src", `${bridge[2]}.ts`)
        content = readFileSync(actualPath, "utf8")
      }
      records.push({ source, file, name, path, actualPath, content, base: file.slice(0, -ext.length) })
    }
  }
  const byPath = new Map(
    records.flatMap((record) => [
      [record.path, record],
      [record.actualPath, record],
    ])
  )
  const resolveRecord = (file, spec) => {
    const full = resolve(dirname(file), spec)
    return byPath.get(full) ?? byPath.get(`${full}.ts`) ?? byPath.get(`${full}.tsx`)
  }

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
    if (framework === "react-native") {
      const nativeDoc = join(root, "docs/content/native/components", `${name}.md`)
      return existsSync(nativeDoc) ? readFileSync(nativeDoc, "utf8").trim() : undefined
    }
    const pretty = name.replace(/-/g, " ")
    for (const [heading, text] of docSections) {
      if (heading === pretty || heading.startsWith(pretty + " ") || heading.includes(`\`${name}`)) return text
    }
    // Sections that mention the file explicitly.
    const file = new RegExp(`(?<![\\w-])${name}\\.tsx?\\b`)
    for (const [, text] of docSections) if (file.test(text)) return text
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

  const css = framework === "react" ? readFileSync(join(packageRoot, "src/styles/arkcn.css"), "utf8") : ""
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

  const extractProps = createPropsExtractor(`packages/${framework}/tsconfig.json`)
  const items = []
  for (const record of records) {
    const { source, file, name, base } = record
    const content = record.content.replace(/from "([^"]+)"/g, (match, spec) => {
      if (!spec.startsWith(".")) return match
      const target = resolveRecord(record.actualPath, spec)
      if (!target) throw new Error(`Unmapped registry import ${spec} in ${record.actualPath}`)
      return `from "@/${target.source.target}/${target.file.replace(/\.tsx?$/, "")}"`
    })
    const registryDependencies = new Set()
    const dependencies = new Set()
    for (const m of content.matchAll(/(?:from\s+|import\s*)"([^"]+)"/g)) {
      const spec = m[1]
      if (spec.startsWith("@/")) {
        const target = spec.replace(/^@\//, "").replace(/^components\/ui\//, "")
        if (target !== name) registryDependencies.add(target)
      } else if (!spec.startsWith(".")) {
        const dep = packageOf(spec)
        if (!["react", "react-dom", "react-native"].includes(dep)) dependencies.add(dep)
      }
    }
    if (dependencies.has("lucide-react-native")) dependencies.add("react-native-svg")
    if (dependencies.has("react-native-reanimated")) dependencies.add("react-native-worklets")
    const ark = content.match(/(\w+) as \w+Primitive/)?.[1]
    // Modules may mix export declarations and export lists (e.g. a namespace plus context hooks).
    const exportsList = [
      ...new Set([
        ...[...content.matchAll(/\nexport \{([\s\S]*?)\}/g)].flatMap((block) =>
          block[1]
            .split(",")
            .map((entry) => entry.trim())
            .filter((entry) => entry && !entry.startsWith("type "))
            .map((entry) => entry.replace(/^\w+ as /, ""))
        ),
        ...[...content.matchAll(/^export (?:async )?(?:function|const|class) (\w+)/gm)].map((match) => match[1]),
      ]),
    ]
    items.push({
      name,
      type: source.type,
      description:
        framework === "react-native"
          ? (content.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? "")
              .replace(/^\s*\*\s?/gm, "")
              .replace(/\s+/g, " ")
              .trim()
          : describe(content, base),
      ark,
      exports: exportsList,
      parts: source.type === "ui" ? extractProps(relative(root, record.path)) : [],
      dependencies: Object.fromEntries([...dependencies].sort().map((d) => [d, versions[d] ?? "latest"])),
      registryDependencies: [...registryDependencies].sort(),
      files: [{ path: `${source.target}/${file}`, content }],
      css: fragments.get(name),
      docs: docsFor(base),
    })
  }

  // Write in place (no rm -rf): the docs dev server watches this folder, and a moment with
  // index.json missing leaves its module graph broken until a restart. Stale items are pruned.
  const out = join(root, "packages/registry/registry", framework)
  mkdirSync(join(out, "items"), { recursive: true })
  const expected = new Set(items.map((item) => join(out, "items", `${item.name}.json`)))
  const prune = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) prune(full)
      else if (!expected.has(full)) rmSync(full)
    }
  }
  prune(join(out, "items"))
  for (const item of items) {
    mkdirSync(join(out, "items", dirname(item.name)), { recursive: true })
    writeFileSync(join(out, "items", `${item.name}.json`), JSON.stringify(item, null, 2) + "\n")
  }
  writeFileSync(join(out, "base.css"), framework === "react-native" ? "" : base.replace(/\n{3,}/g, "\n\n"))
  writeFileSync(
    join(out, "index.json"),
    JSON.stringify(
      {
        name: pkg.name,
        framework,
        initItems: framework === "react-native" ? ["lib/theme"] : ["lib/utils"],
        version: pkg.version,
        baseDependencies: Object.fromEntries(requiredPeers.map((d) => [d, versions[d]])),
        items: items.map(
          ({ name, type, description, ark, exports: exportsList, dependencies, registryDependencies, files, css }) => ({
            name,
            type,
            description,
            ark,
            exports: exportsList,
            dependencies: Object.keys(dependencies),
            registryDependencies,
            files: files.map((f) => f.path),
            css: !!css,
          })
        ),
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
  console.log(`build-registry (${framework}): ${items.length} items, ${fragments.size} css fragment(s)`)
}
