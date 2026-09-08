// Compare the public namespace API to the installed Ark version, including providers.
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = new URL("..", import.meta.url).pathname
const coverage = JSON.parse(fs.readFileSync(path.join(root, "scripts/ark-coverage.json"), "utf8"))
const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root)
const program = ts.createProgram(config.fileNames, config.options)
const checker = program.getTypeChecker()
const arkDir = path.join(root, "node_modules/@ark-ui/react/dist/components")
const index = fs.readFileSync(path.join(arkDir, "index.d.ts"), "utf8")
const problems = []
let count = 0
for (const [, family] of index.matchAll(/export \* from '\.\/(.*?)\/index\.js'/g)) {
  const entry = coverage[family]
  if (!entry) {
    problems.push(`${family}: component family is not covered`)
    continue
  }
  const source = program.getSourceFile(path.join(root, `src/components/ui/${entry.module}.tsx`))
  const module = source && checker.getSymbolAtLocation(source)
  let exported = module && checker.getExportsOfModule(module).find((item) => item.name === entry.namespace)
  if (!exported) {
    problems.push(`${family}: missing public namespace ${entry.namespace}`)
    continue
  }
  if (exported.flags & ts.SymbolFlags.Alias) exported = checker.getAliasedSymbol(exported)
  const type = checker.getTypeOfSymbolAtLocation(exported, exported.valueDeclaration)
  if (type.getCallSignatures().length)
    problems.push(`${family}: export the namespace object, not a callable compatibility API`)
  if (entry.alternative) {
    for (const part of ["Root", "Item", "ItemGroup", "PrevTrigger", "NextTrigger"]) {
      if (!type.getProperty(part)) problems.push(`${family}: missing ${part}`)
    }
    continue
  }
  const declaration = fs.readFileSync(path.join(arkDir, family, `${family}.d.ts`), "utf8")
  const parts = entry.standalone
    ? ["Root"]
    : [...declaration.matchAll(/export \{ \w+ as (\w+)[, }]/g)].map((match) => match[1])
  for (const part of parts) {
    if (!type.getProperty(part)) problems.push(`${family}: missing public ${entry.namespace}.${part}`)
    else count++
  }
}
if (problems.length) {
  console.error("check-ark-parts:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log(`check-ark-parts: ${Object.keys(coverage).length} families, ${count} parts; Embla carousel retained`)
