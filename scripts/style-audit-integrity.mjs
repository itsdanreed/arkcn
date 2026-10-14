import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const hash = (source) => createHash("sha256").update(source).digest("hex")
const read = (file) => readFileSync(file, "utf8")
const directories = ["ui", "adapters", "examples"]
const assets = [
  "reference.css",
  "tailwind.css",
  "nova.css",
  "adapt.tsx",
  "use-mobile.ts",
  "icon-placeholder.tsx",
  "../src/audit-motion.ts",
  "../src/audit-carousel-motion.ts",
]
function filesAt(destination) {
  return [
    ...assets,
    ...directories.flatMap((dir) => readdirSync(path.join(destination, dir)).map((f) => `${dir}/${f}`)),
  ].sort()
}
export function fixtureOverrides(source, file) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const results = []
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const component = node.tagName.getText(parsed)
      {
        for (const attribute of node.attributes.properties) {
          if (ts.isJsxSpreadAttribute(attribute) || ["className", "style"].includes(attribute.name?.getText(parsed))) {
            results.push({
              component,
              kind: /^[A-Z]/.test(component) ? "component" : "wrapper",
              attribute: attribute.getText(parsed),
              line: parsed.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            })
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(parsed)
  return results
}
export function writeAuditIntegrity(destination, revision) {
  const files = Object.fromEntries(filesAt(destination).map((file) => [file, hash(read(path.join(destination, file)))]))
  const overrides = Object.fromEntries(
    readdirSync(path.join(destination, "examples"))
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => [
        file.replace(/\.tsx$/, ""),
        fixtureOverrides(read(path.join(destination, "examples", file)), file),
      ])
  )
  writeFileSync(path.join(destination, "integrity.json"), JSON.stringify({ revision, files, overrides }, null, 2))
}
export function checkAuditIntegrity(root) {
  const destination = path.join(root, "docs/.style-audit")
  if (!existsSync(path.join(destination, "integrity.json")))
    throw new Error("Run npm run audit:prepare to create the reference integrity record.")
  const record = JSON.parse(read(path.join(destination, "integrity.json")))
  const actualFiles = filesAt(destination)
  if (JSON.stringify(actualFiles) !== JSON.stringify(Object.keys(record.files).sort()))
    throw new Error("Reference file inventory changed; regenerate from pinned upstream.")
  for (const [file, expected] of Object.entries(record.files)) {
    if (hash(read(path.join(destination, file))) !== expected)
      throw new Error(`Reference changed after preparation: ${file}`)
  }
  const allowedHelpers = new Set(["../../src/audit-motion", "../../src/audit-carousel-motion"])
  for (const file of actualFiles.filter((f) => /\.tsx?$/.test(f))) {
    const source = read(path.join(destination, file))
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node) {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
            ? node.arguments[0]
            : undefined
      if (specifier && ts.isStringLiteral(specifier)) {
        const value = specifier.text
        if (
          value.startsWith("@/") ||
          value.includes("arkcn") ||
          value.includes("packages/") ||
          /\.css$/.test(value) ||
          (value.startsWith(".") &&
            !allowedHelpers.has(value) &&
            !path.resolve(destination, path.dirname(file), value).startsWith(destination + path.sep))
        )
          throw new Error(`Unexpected reference import in ${file}: ${value}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(parsed)
    if (file.startsWith("examples/")) {
      const authored = path.join(root, "scripts/fixtures/style-audit", path.basename(file))
      if (existsSync(authored) && read(authored) !== source)
        throw new Error(`Stale generated fixture: ${file}; run npm run audit:prepare`)
    }
  }
  const referenceCss = read(path.join(destination, "reference.css"))
  const currentCss = read(path.join(root, "docs/src/catalog-audit.css"))
  for (const [name, css] of [
    ["reference", referenceCss],
    ["current", currentCss],
  ]) {
    if (!css.includes('@import "tailwindcss" source(none)'))
      throw new Error(`${name}: automatic Tailwind scanning must be disabled`)
  }
  const inputs = (css, directive) =>
    [...css.matchAll(new RegExp(`@${directive}\\s+"([^"]+)"`, "g"))].map((match) => match[1]).sort()
  for (const [name, css, imports, sources] of [
    [
      "reference",
      referenceCss,
      ["tailwindcss", "tw-animate-css", "@fontsource-variable/geist", "./tailwind.css"],
      ["./", "../src/shadcn-reference.tsx"],
    ],
    [
      "current",
      currentCss,
      ["tailwindcss", "@fontsource-variable/geist", "../../packages/react/src/styles/arkcn.css"],
      ["../../packages/react/src", "./examples", "./audit-examples", "./catalog-audit.tsx"],
    ],
  ]) {
    if (
      JSON.stringify(inputs(css, "import")) !== JSON.stringify(imports.sort()) ||
      JSON.stringify(inputs(css, "source")) !== JSON.stringify(sources.sort())
    )
      throw new Error(`${name}: unexpected CSS import or Tailwind source scope`)
  }
  if (referenceCss.includes("arkcn") || referenceCss.includes("index.css"))
    throw new Error("Reference CSS must not import implementation styles")
  if (currentCss.includes(".style-audit") || currentCss.includes("index.css"))
    throw new Error("Current audit CSS must not import reference or docs page styles")
  return record
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url))
  const record = checkAuditIntegrity(root)
  console.log(
    `style-audit integrity: ${Object.keys(record.files).length} reference files intact; ${Object.values(record.overrides).filter((items) => items.length).length} fixtures disclose styling customizations`
  )
}
