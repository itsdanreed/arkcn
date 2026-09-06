// Enforces the project's quote rule with the TypeScript parser (no formatter):
// string literals use double quotes; template literals only when they interpolate.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

const roots = ["src", "scripts", "cli", "bin", "mcp"]
const offenders = []

function walk(path) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (!stat) return
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry))
    return
  }
  if (!/\.(ts|tsx|mjs|js)$/.test(path)) return
  const text = readFileSync(path, "utf8")
  const source = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const report = (node, message) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart())
    offenders.push(`${relative(process.cwd(), path)}:${line + 1}: ${message}`)
  }
  const visit = (node) => {
    if (ts.isStringLiteral(node) && node.getText().startsWith("'") && !node.text.includes('"')) {
      report(node, `use double quotes: ${node.getText()}`)
    }
    // Tagged templates (e.g. String.raw`...`) are exempt; they need the backtick semantics.
    if (
      ts.isNoSubstitutionTemplateLiteral(node) &&
      !ts.isTaggedTemplateExpression(node.parent) &&
      !node.text.includes("\n") &&
      !node.text.includes("`") &&
      !node.text.includes('"')
    ) {
      report(node, `template literal without interpolation: ${node.getText()}`)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

roots.forEach(walk)
if (offenders.length) {
  console.error("Quote rule: double quotes for strings, backticks only with ${} interpolation:")
  offenders.forEach((o) => console.error("  " + o))
  process.exit(1)
}
console.log("check-quotes: ok")
