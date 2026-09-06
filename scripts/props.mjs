// Extracts prop tables for every exported component part with the TypeScript compiler:
// name, type, whether it is required, the default (from JSDoc @default or the destructuring
// default in our wrapper), and the JSDoc description. Props that come from React's generic
// HTML attribute types are skipped so the tables show what the part itself adds; props from
// Ark UI, zag, and other libraries are kept since they document the behaviour.
import { join } from "node:path"
import ts from "typescript"

const root = new URL("..", import.meta.url).pathname

export function createPropsExtractor() {
  const configFile = ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile)
  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root)
  const program = ts.createProgram(config.fileNames, config.options)
  const checker = program.getTypeChecker()

  const isReactBuiltin = (fileName) => /@types\/react\//.test(fileName) || /typescript\/lib\/lib\./.test(fileName)
  const keepFromReact = new Set(["className", "children", "style"])

  const typeText = (type) => {
    const raw = checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
    )
    const text = raw.replace(/ \| undefined$/, "")
    return text.length > 160 ? text.slice(0, 157) + "…" : text
  }

  /** Default values written in the wrapper's destructuring, e.g. `({ size = "default" })`. */
  const destructuredDefaults = (signature) => {
    const out = {}
    const param = signature.getParameters()[0]
    const decl = param?.valueDeclaration
    if (!decl || !ts.isParameter(decl) || !ts.isObjectBindingPattern(decl.name)) return out
    for (const el of decl.name.elements) {
      if (el.initializer && ts.isIdentifier(el.name)) out[el.name.text] = el.initializer.getText()
    }
    return out
  }

  const origin = (fileName) => {
    if (fileName.startsWith(join(root, "src"))) return "arkcn"
    const m = fileName.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
    return m ? m[1] : "other"
  }

  return function extract(file) {
    const source = program.getSourceFile(join(root, file))
    if (!source) return []
    const moduleSymbol = checker.getSymbolAtLocation(source)
    if (!moduleSymbol) return []
    const parts = []
    for (const exp of checker.getExportsOfModule(moduleSymbol)) {
      const symbol = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp
      if (!/^[A-Z]/.test(exp.name)) continue
      const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
      if (!decl) continue
      const type = checker.getTypeOfSymbolAtLocation(symbol, decl)
      const signature = type.getCallSignatures()[0]
      if (!signature) continue
      const param = signature.getParameters()[0]
      if (!param) {
        parts.push({ name: exp.name, props: [] })
        continue
      }
      const propsType = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? decl)
      const defaults = destructuredDefaults(signature)
      const props = []
      for (const prop of checker.getPropertiesOfType(propsType)) {
        const propDecl = prop.declarations?.[0]
        const fileName = propDecl?.getSourceFile().fileName ?? ""
        if (prop.name === "ref" || prop.name.startsWith("__")) continue
        if (isReactBuiltin(fileName) && !keepFromReact.has(prop.name)) continue
        const docs = ts.displayPartsToString(prop.getDocumentationComment(checker)).trim()
        const tags = prop.getJsDocTags(checker)
        const defaultTag = tags.find((t) => t.name === "default")
        const propType = checker.getTypeOfSymbolAtLocation(prop, propDecl ?? decl)
        props.push({
          name: prop.name,
          type: typeText(propType),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          default: defaults[prop.name] ?? (defaultTag ? ts.displayPartsToString(defaultTag.text).trim() : undefined),
          description: docs || undefined,
          from: origin(fileName),
        })
      }
      const rank = { arkcn: 0 }
      props.sort(
        (a, b) =>
          (rank[a.from] ?? 1) - (rank[b.from] ?? 1) ||
          Number(b.required) - Number(a.required) ||
          a.name.localeCompare(b.name)
      )
      parts.push({ name: exp.name, props })
    }
    return parts
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const extract = createPropsExtractor()
  const file = process.argv[2] ?? "src/components/ui/dialog.tsx"
  console.log(JSON.stringify(extract(file), null, 2).slice(0, 6000))
}
