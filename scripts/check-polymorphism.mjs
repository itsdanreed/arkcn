// Every replaceable DOM part must advertise asChild. Non-DOM and integration
// boundaries are explicit, reviewed exceptions rather than file-wide skips.
import fs from "node:fs"
import path from "node:path"
import { createPropsExtractor } from "./props.mjs"

const root = new URL("..", import.meta.url).pathname
const extract = createPropsExtractor()
const exceptions = JSON.parse(fs.readFileSync(path.join(root, "scripts/polymorphism-exceptions.json"), "utf8"))
const problems = []
let count = 0
const used = new Set()
for (const file of fs.readdirSync(path.join(root, "src/components/ui")).filter((file) => file.endsWith(".tsx"))) {
  for (const part of extract(`src/components/ui/${file}`)) {
    const key = `${file}:${part.name}`
    const props = new Set(part.props.map((prop) => prop.name))
    if (props.has("asChild")) {
      count++
      continue
    }
    if (!props.has("className") && !props.has("style")) continue
    if (exceptions[key]) used.add(key)
    else problems.push(`${key}: DOM-like props without asChild`)
  }
}
for (const key of Object.keys(exceptions)) if (!used.has(key)) problems.push(`${key}: stale exception`)
if (problems.length) {
  console.error("check-polymorphism:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log(`check-polymorphism: ${count} parts accept asChild; ${used.size} documented rendering boundaries`)
