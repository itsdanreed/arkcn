import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { createRegistry } from "@multicomma/arkcn-registry"

const root = fileURLToPath(new URL("..", import.meta.url))
const packages = readdirSync(join(root, "packages"))
const manifests = packages.map((name) => JSON.parse(readFileSync(join(root, "packages", name, "package.json"))))
const byName = new Map(manifests.map((pkg) => [pkg.name, pkg]))
const walk = (name, chain = []) => {
  assert(!chain.includes(name), `Package cycle: ${[...chain, name].join(" -> ")}`)
  const pkg = byName.get(name)
  for (const [dep, version] of Object.entries(pkg.dependencies ?? {})) {
    if (!byName.has(dep)) continue
    assert.equal(version, byName.get(dep).version, `${name} must pin its release siblings`)
    walk(dep, [...chain, name])
  }
}
for (const name of byName.keys()) walk(name)

// Native and shared code must never pull a DOM renderer, CSS, or a web UI dependency.
for (const name of ["core", "react-shared", "react-native"]) {
  const base = join(root, "packages", name, "src")
  for (const file of readdirSync(base, { recursive: true }).filter((file) => /\.tsx?$/.test(file))) {
    const source = readFileSync(join(base, file), "utf8")
    assert.doesNotMatch(source, /from ["'](?:@ark-ui\/|react-dom|@atlaskit\/|lucide-react["' /]|.*\.css)/)
    assert.doesNotMatch(source, /\b(?:document|window|HTMLElement|HTMLDivElement)\b/)
  }
}
for (const framework of ["react", "react-native"]) {
  const registry = createRegistry(undefined, { framework })
  const index = await registry.index()
  assert(index.items.length > 0)
  if (framework === "react-native") {
    const format = index.items.find((item) => item.name === "format")
    for (const dependency of ["@formatjs/intl-pluralrules", "@formatjs/intl-relativetimeformat"]) {
      assert(format.dependencies.includes(dependency), `format registry includes side-effect dependency ${dependency}`)
    }
    for (const [name, namespace, hook] of [
      ["toggle", "Toggle", "useToggle"],
      ["toggle-group", "ToggleGroup", "useToggleGroup"],
      ["accordion", "Accordion", "useAccordion"],
    ]) {
      const item = index.items.find((item) => item.name === name)
      assert(
        item.exports.includes(namespace),
        `${name} retains its namespace alongside separately exported context hooks`
      )
      assert(item.exports.includes(hook), `${name} exposes its state hook in the registry`)
      assert(!item.description.startsWith("Controlled"), `${name} describes the component, not its first prop`)
    }
  }

  for (const entry of index.items) {
    const { items, missing } = await registry.closure([entry.name])
    assert.deepEqual(missing, [], `${framework}/${entry.name} has no missing helpers`)
    const files = new Set(items.flatMap((item) => item.files.map((file) => file.path.replace(/\.tsx?$/, ""))))
    for (const item of items) {
      assert(!Object.keys(item.dependencies).some((dep) => dep.startsWith("@multicomma/arkcn")))
      for (const file of item.files) {
        assert.doesNotMatch(file.content, /from "(?:@multicomma\/arkcn|\.\.?\/)/)
        for (const [, target] of file.content.matchAll(/from "@\/([^"]+)"/g))
          assert(files.has(target), `${framework}/${entry.name} must copy ${target}`)
      }
    }
  }
}

const temp = mkdtempSync(join(tmpdir(), "arkcn-packages-"))
let client
try {
  // Unpack real tarballs outside the repo: workspace symlinks cannot mask missing files.
  const output = execFileSync(
    "npm",
    [
      "pack",
      ...packages.flatMap((name) => ["--workspace", `packages/${name}`]),
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      temp,
    ],
    { cwd: root, encoding: "utf8" }
  )
  const packs = JSON.parse(output)
  for (const pack of packs) {
    const target = join(temp, "node_modules", pack.name)
    mkdirSync(target, { recursive: true })
    execFileSync("tar", ["-xzf", join(temp, pack.filename), "--strip-components=1", "-C", target])
    const pkg = byName.get(pack.name)
    for (const path of Object.values(pkg.exports ?? {})) {
      if (!path.includes("*")) assert(existsSync(join(target, path)), `${pack.name}: missing ${path}`)
    }
    for (const path of Object.values(pkg.bin ?? {})) assert(existsSync(join(target, path)))
  }
  const bin = join(temp, "node_modules/@multicomma/arkcn/bin/arkcn.mjs")
  const run = (...args) => execFileSync(process.execPath, [bin, ...args], { cwd: temp, encoding: "utf8" })
  assert.match(run("list", "dialog"), /dialog/)
  assert.match(run("list", "button", "--framework", "react-native"), /lib\/theme/)
  assert.match(run("list", "--framework", "react-native"), /alert-dialog/)
  assert.doesNotMatch(run("list", "--framework", "react-native"), /@ark-ui/)

  // Only MCP's declared external dependencies are made available to this isolated package tree.
  for (const name of ["@modelcontextprotocol/sdk", "zod"]) {
    const target = join(temp, "node_modules", name)
    mkdirSync(join(target, ".."), { recursive: true })
    symlinkSync(join(root, "node_modules", name), target)
  }
  client = new Client({ name: "arkcn-package-test", version: "1.0.0" })
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [bin, "mcp", "--framework", "react-native", "--cwd", temp],
      stderr: "pipe",
    })
  )
  const tools = await client.listTools()
  assert(tools.tools.some((tool) => tool.name === "add_components"))
  const result = await client.callTool({ name: "get_component", arguments: { name: "button" } })
  assert(!result.isError)
  const button = JSON.parse(result.content[0].text)
  assert.match(button.files[0].content, /react-native/)
  assert.doesNotMatch(button.files[0].content, /@ark-ui|react-dom/)
  console.log("test-packages: acyclic workspaces, closed registries, packed CLI, and native MCP pass")
} finally {
  await client?.close()
  rmSync(temp, { recursive: true, force: true })
}
