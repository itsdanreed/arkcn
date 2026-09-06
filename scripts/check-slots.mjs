// Fails when app/demo code passes `data-slot` to a toolkit part: the prop
// overrides the part's own slot and silently breaks styling hooks.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const roots = ["src/demo", "src/app.tsx", "src/main.tsx"]
const offenders = []

function walk(path) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (!stat) return
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry))
    return
  }
  if (!/\.(tsx|jsx)$/.test(path)) return
  // Demo-owned compositions that define their own parts (e.g. settings-layout.tsx, apps-view.tsx).
  if (/-(layout|view)\.tsx$/.test(path)) return
  const lines = readFileSync(path, "utf8").split("\n")
  lines.forEach((line, i) => {
    // Only JSX attributes: a `[data-slot=...]` selector inside a class string is fine.
    if (/(^|\s)data-slot\s*=/.test(line)) offenders.push(`${relative(process.cwd(), path)}:${i + 1}: ${line.trim()}`)
  })
}

roots.forEach(walk)
if (offenders.length) {
  console.error("data-slot must only be set inside src/components/ui (it overrides a part's own slot):")
  offenders.forEach((o) => console.error("  " + o))
  process.exit(1)
}
console.log("check-slots: ok")
