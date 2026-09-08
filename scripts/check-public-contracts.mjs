// Keep implementation/debugger names and extensible prop contracts aligned with
// the public component namespaces.
import path from "node:path"
import ts from "typescript"

const root = new URL("..", import.meta.url).pathname
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const program = ts.createProgram(parsed.fileNames, parsed.options)
const checker = program.getTypeChecker()
const problems = []
let count = 0
for (const file of program
  .getSourceFiles()
  .filter((file) => file.fileName.startsWith(path.join(root, "src/components/ui/")))) {
  if (file.statements.some((statement) => ts.isModuleDeclaration(statement)))
    problems.push(`${file.fileName}: merged namespaces are not part of the public contract`)
  const declarations = file.statements.flatMap((statement) =>
    ts.isVariableStatement(statement) ? [...statement.declarationList.declarations] : [statement]
  )
  const exports = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(file)).map((symbol) => symbol.name))
  for (const declaration of declarations) {
    if (
      !declaration.name ||
      !exports.has(declaration.name.getText(file)) ||
      !declaration.initializer ||
      !ts.isObjectLiteralExpression(declaration.initializer)
    )
      continue
    const family = declaration.name.text
    for (const part of declaration.initializer.properties) {
      if (!ts.isPropertyAssignment(part) || !/^[A-Z]/.test(part.name.getText(file))) continue
      const name = family + part.name.getText(file)
      if (part.initializer.getText(file) !== name)
        problems.push(`${family}.${part.name.getText(file)} must use implementation ${name}`)
      const props = name + "Props"
      if (!exports.has(props) || exports.has(name))
        problems.push(`${family} must export ${props} and keep ${name} private`)
      let implementation = declarations.find((item) => item.name?.getText(file) === name)
      if (implementation && ts.isVariableDeclaration(implementation)) implementation = implementation.initializer
      const parameter = implementation?.parameters?.[0]
      if (
        parameter &&
        (!parameter.type || !ts.isTypeReferenceNode(parameter.type) || parameter.type.typeName.getText(file) !== props)
      )
        problems.push(`${name} must use ${props} in its signature`)
      count++
    }
  }
}
if (problems.length) {
  console.error(problems.join("\n"))
  process.exit(1)
}
console.log(`check-public-contracts: ${count} component names and named prop exports aligned`)
