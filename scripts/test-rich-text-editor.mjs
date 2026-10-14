import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(`packages/react/src/${specifier.slice(2)}`, root))
      const file = [base, `${base}.tsx`, `${base}.ts`].find(existsSync)
      if (!file) throw new Error(`Cannot resolve ${specifier}`)
      return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    if (specifier.startsWith(".") && context.parentURL?.includes("/packages/")) {
      const base = fileURLToPath(new URL(specifier, context.parentURL))
      const file = [`${base}.tsx`, `${base}.ts`].find(existsSync)
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    // Atlaskit publishes subpath directories with package.json entry points, not ESM exports.
    if (specifier.startsWith("@atlaskit/")) {
      const entry = nextResolve(`${specifier}/package.json`, context)
      const manifest = JSON.parse(readFileSync(fileURLToPath(entry.url), "utf8"))
      return nextResolve(new URL(manifest.main, entry.url).href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const h = React.createElement
// The editor must also render safely before a browser editor instance exists.
const { RichTextEditor } = await import("@multicomma/arkcn-react/ui/rich-text-editor")
const editorShell = renderToStaticMarkup(
  h(
    RichTextEditor.Root,
    { content: "<p>Initial content</p>" },
    h(RichTextEditor.Toolbar, null, h(RichTextEditor.Toggle, { name: "bold", tooltip: false })),
    h(RichTextEditor.Content),
    h(RichTextEditor.Footer, null, h(RichTextEditor.CharacterCount))
  )
)
assert.match(editorShell, /data-slot="rich-text-editor"/)
assert.match(editorShell, /aria-label="Bold"/)

console.log("rich-text-editor: server rendering passed")
