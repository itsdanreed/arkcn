// Extracts prop tables for every exported component part with the TypeScript compiler:
// name, type, whether it is required, the default (from JSDoc @default or the destructuring
// default in our wrapper), and the JSDoc description. Props that come from React's generic
// HTML attribute types are skipped so the tables show what the part itself adds; props from
// Ark UI, zag, and other libraries are kept since they document the behaviour.
import { readFileSync } from "node:fs"
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

  /** Fallback descriptions for props every part shares, when the source has no JSDoc. */
  const common = {
    className: "Extra classes merged into the part's own classes with `cn`.",
    children: "Content rendered inside the part.",
    style: "Inline styles applied to the rendered element.",
    asChild: "Render the child element instead of the default one, merging props and behaviour onto it.",
    variant: "Visual variant, styled with `cva`; sets a `data-variant` attribute.",
    size: "Size variant; sets a `data-size` attribute.",
    value: "The controlled value.",
    defaultValue: "The initial value when uncontrolled.",
    onValueChange: "Called with the new value whenever it changes.",
    open: "The controlled open state.",
    defaultOpen: "The initial open state when uncontrolled.",
    onOpenChange: "Called when the open state changes.",
    disabled: "Disables the part and everything inside it.",
    readOnly: "Shows the value but prevents changes.",
    invalid: "Marks the part invalid for styling and assistive technology.",
    required: "Marks the field as required.",
    placeholder: "Text shown while there is no value.",
    orientation: "Layout direction of the part.",
    side: "Which side of the anchor or container the part sits on.",
    align: "Alignment along the side.",
    ids: "Ids of the parts, for wiring labels and external elements. Never set `id` on a part directly.",
    positioning: "Floating UI positioning options: placement, gutter, sameWidth, and so on.",
    collection: "The collection of items to render.",
    name: "Form field name for the hidden input.",
    label: "Accessible label.",
    onClick: "Click handler.",
    onKeyDown: "Key handler, called before the part's own key handling.",
    onFocus: "Focus handler.",
    onBlur: "Blur handler.",
    onChange: "Change handler.",
    onSelect: "Called when an item is selected.",
    title: "Title text.",
    description: "Description text.",
    icon: "Icon element rendered inside the part.",
    href: "Link destination.",
    active: "Whether the part is the active one; sets `data-active`.",
    selected: "Whether the part is selected; sets `data-selected`.",
    loading: "Shows a loading state.",
    tooltip: "Tooltip content shown on hover, or `false` to disable it.",
    lazyMount: "Mount the content only once it first opens.",
    unmountOnExit: "Unmount the content when it closes.",
    type: "Type of the part.",
    date: "The date this part represents.",
    index: "Position of the item in its list.",
    item: "The item this part renders.",
    node: "The tree node this part renders.",
    row: "The row this part belongs to.",
    column: "Id of the column this part belongs to.",
    table: "The table instance, when not read from context.",
    editable: "Allow editing.",
    multiple: "Allow selecting more than one item.",
    closeOnSelect: "Close the popup after a selection.",
    onEscape: "Called when Escape is pressed.",
    showCloseButton: "Render the close button.",
  }

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

  /** Descriptions for props whose inline types cannot carry JSDoc, keyed by component then prop. */
  const overrides = JSON.parse(readFileSync(join(root, "scripts/prop-docs.json"), "utf8"))

  return function extract(file) {
    const component = file.replace(/^.*\//, "").replace(/\.tsx?$/, "")
    const local = overrides[component] ?? {}
    const source = program.getSourceFile(join(root, file))
    if (!source) return []
    const moduleSymbol = checker.getSymbolAtLocation(source)
    if (!moduleSymbol) return []
    const parts = []
    const targets = []
    for (const exp of checker.getExportsOfModule(moduleSymbol)) {
      const symbol = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp
      if (!/^[A-Z]/.test(exp.name)) continue
      const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
      if (!decl) continue
      const type = checker.getTypeOfSymbolAtLocation(symbol, decl)
      if (type.getCallSignatures().length) targets.push({ name: exp.name, symbol, decl, type })
      for (const member of type.getProperties()) {
        if (!/^[A-Z]/.test(member.name)) continue
        const memberDecl = member.valueDeclaration ?? member.declarations?.[0] ?? decl
        const memberType = checker.getTypeOfSymbolAtLocation(member, memberDecl)
        if (memberType.getCallSignatures().length) {
          targets.push({ name: `${exp.name}.${member.name}`, symbol: member, decl: memberDecl, type: memberType })
        }
      }
    }
    for (const { name, decl, type } of targets) {
      const signature = type.getCallSignatures()[0]
      if (!signature) continue
      const param = signature.getParameters()[0]
      if (!param) {
        parts.push({ name, props: [] })
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
          description: docs || local[prop.name] || common[prop.name] || undefined,
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
      parts.push({ name, props })
    }
    return parts
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const extract = createPropsExtractor()
  const file = process.argv[2] ?? "src/components/ui/dialog.tsx"
  console.log(JSON.stringify(extract(file), null, 2).slice(0, 6000))
}
