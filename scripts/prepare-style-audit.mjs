import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { writeAuditIntegrity, checkAuditIntegrity } from "./style-audit-integrity.mjs"
import { generateExamples } from "./fixtures/style-audit/generate.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))
const revision = "30a58d4498f270af1c1e981a7d78a15cf5740841"
const destination = path.join(root, "docs/.style-audit")
const upstream = `https://raw.githubusercontent.com/shadcn-ui/ui/${revision}/`
const fixture = path.join(root, "scripts/fixtures/style-audit")
const authoredFixtures = readdirSync(fixture)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => [file, readFileSync(path.join(fixture, file), "utf8")])
for (const [file, source] of authoredFixtures) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
    const specifier = statement.moduleSpecifier.text
    if (
      specifier.startsWith("@/") ||
      specifier.startsWith("@multicomma/arkcn") ||
      specifier.includes("packages/react")
    ) {
      throw new Error(`${file}: the shadcn reference must not import arkcn (${specifier})`)
    }
  }
}
async function read(file) {
  const response = await fetch(upstream + file)
  if (!response.ok) throw new Error(`${response.status}: ${file}`)
  return response.text()
}
function save(file, source) {
  const target = path.join(destination, file)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, source)
}
const treeResponse = await fetch(`https://api.github.com/repos/shadcn-ui/ui/git/trees/${revision}?recursive=1`)
if (!treeResponse.ok) throw new Error(`GitHub tree: ${treeResponse.status}`)
const { tree } = await treeResponse.json()
const names = readdirSync(path.join(root, "packages/react/src/components/ui")).map((file) => file.replace(/\.tsx$/, ""))
const files = tree.filter(
  ({ path: file }) => file.startsWith("apps/v4/registry/bases/base/ui/") && names.includes(path.basename(file, ".tsx"))
)
const nova = await read("apps/v4/registry/styles/style-nova.css")
const novaClasses = Object.fromEntries(
  [...nova.matchAll(/\.(cn-[\w-]+)\s*\{\s*@apply\s+([^;]+);\s*\}/g)].map((match) => [
    match[1],
    match[2].replace(/\s+/g, " ").trim(),
  ])
)
novaClasses["cn-font-heading"] = "font-heading"
novaClasses["cn-menu-target"] = ""
novaClasses["cn-menu-translucent"] = ""
novaClasses["cn-menu-translucent-aria"] = ""
novaClasses["cn-rtl-flip"] = "rtl:rotate-180"
const results = await Promise.allSettled(
  files.map(async ({ path: file }) => {
    const source = (await read(file))
      .replace(/\bcn-[\w-]+\b/g, (name) => novaClasses[name] ?? name)
      .replaceAll("@/registry/bases/base/ui/", "./")
      .replaceAll("@/registry/bases/base/hooks/use-mobile", "../use-mobile")
      .replaceAll("@/app/(create)/components/icon-placeholder", "../icon-placeholder")
    save(`ui/${path.basename(file)}`, source)
  })
)
for (const result of results) if (result.status === "rejected") throw result.reason
// Keep the docs TOC list recipe intact. Only remap imports for this isolated harness;
// the dropdown branch is not rendered by the TOC comparison fixture.
save(
  "ui/docs-toc.tsx",
  (await read("apps/v4/components/docs-toc.tsx"))
    .replace('import { IconMenu3 } from "@tabler/icons-react"', 'import { MenuIcon as IconMenu3 } from "lucide-react"')
    .replaceAll("@/registry/new-york-v4/ui/", "./")
)
save("ui/chart-iframe.tsx", await read("apps/v4/components/chart-iframe.tsx"))
save("use-mobile.ts", await read("apps/v4/registry/bases/base/hooks/use-mobile.ts"))
save("nova.css", await read("apps/v4/registry/styles/style-nova.css"))
save("tailwind.css", await read("packages/shadcn/src/tailwind.css"))
save("LICENSE", await read("LICENSE.md"))
const themes = ts.transpile(await read("apps/v4/registry/themes.ts"), { module: ts.ModuleKind.ESNext })
const { THEMES } = await import(`data:text/javascript;base64,${Buffer.from(themes).toString("base64")}`)
const neutral = THEMES.find((theme) => theme.name === "neutral").cssVars
const globals = await read("apps/v4/app/globals.css")
const themeBlock = globals.slice(globals.indexOf("@theme inline"), globals.indexOf(":root"))
save(
  "reference.css",
  `@import "tailwindcss" source(none);\n@import "tw-animate-css";\n@import "@fontsource-variable/geist";\n@import "./tailwind.css";\n@source "./";\n@source "../src/shadcn-reference.tsx";\n@custom-variant dark (&:is(.dark *));\n${themeBlock}\n:root {--font-sans: "Geist Variable", sans-serif; --font-heading: var(--font-sans); ${Object.entries(
    neutral.light
  )
    .map(([k, v]) => `--${k}: ${v};`)
    .join("\n")}}\n.dark {${Object.entries(neutral.dark)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(
      "\n"
    )}}\n@layer base { * {@apply border-border outline-ring/50;} body {@apply bg-background text-foreground font-sans;} }\n[data-reduced-motion=true] *, [data-reduced-motion=true] *::before, [data-reduced-motion=true] *::after { animation: none !important; transition-duration: 0s !important; }`
)
save(
  "icon-placeholder.tsx",
  `import * as Icons from "lucide-react"\nexport function IconPlaceholder({lucide, tabler, hugeicons, phosphor, remixicon, ...props}: Record<string, any>) { const Icon = Icons[lucide as keyof typeof Icons] as React.ElementType; return Icon ? <Icon {...props} /> : null }\n`
)
save(
  "package.json",
  JSON.stringify(
    { private: true, type: "module", dependencies: { "@base-ui/react": "1.6.0", cmdk: "1.1.1", cn: "0.2.2" } },
    null,
    2
  )
)
save(
  "manifest.json",
  JSON.stringify(
    {
      repository: "https://github.com/shadcn-ui/ui",
      revision,
      style: "Nova",
      theme: "neutral",
      components: files.map(({ path: file }) => path.basename(file, ".tsx")),
    },
    null,
    2
  )
)
generateExamples(
  root,
  destination,
  files.map(({ path: file }) => path.basename(file, ".tsx"))
)
for (const [file, source] of authoredFixtures) save(`examples/${file}`, source)
writeAuditIntegrity(destination, revision)
checkAuditIntegrity(root)
console.log(
  `style-audit: ${files.length} actual shadcn components at ${revision}; Nova + neutral theme. Run npm install --prefix docs/.style-audit --ignore-scripts to install reference-only dependencies.`
)
