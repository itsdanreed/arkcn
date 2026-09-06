// Fails when an Ark-backed component in src/components/ui does not use every part of the
// Ark component it wraps (`X as XPrimitive` import). Compositions over our own wrappers
// (command on Listbox, menubar on Menu, sheet on Dialog, cascader/tree-select on Popover)
// are listed as exceptions.
import fs from "node:fs"
import path from "node:path"

const dir = "src/components/ui"
const arkDir = "node_modules/@ark-ui/react/dist/components"
const exceptions = new Set(["command.tsx", "menubar.tsx", "sheet.tsx", "cascader.tsx", "tree-select.tsx"])
const skipParts = /^(Context|RootProvider|Provider|ItemContext)$/
const problems = []

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && !exceptions.has(f))) {
  const src = fs.readFileSync(path.join(dir, file), "utf8")
  for (const [, ark] of src.matchAll(/(\w+) as (\w+)Primitive/g)) {
    const kebab = ark.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
    const idx = path.join(arkDir, kebab, `${kebab}.d.ts`)
    if (!fs.existsSync(idx)) continue
    const d = fs.readFileSync(idx, "utf8")
    const parts = [...d.matchAll(/export \{ \w+ as (\w+),/g)].map((m) => m[1]).filter((p) => !skipParts.test(p))
    const missing = parts.filter((p) => !new RegExp(`${ark}Primitive\\.${p}\\b`).test(src))
    if (missing.length) problems.push(`${file} (${ark}): ${missing.join(", ")}`)
  }
}

if (problems.length) {
  console.error("check-ark-parts: missing Ark parts\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("check-ark-parts: ok")
