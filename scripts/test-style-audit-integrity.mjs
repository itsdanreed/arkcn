import assert from "node:assert/strict"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { checkAuditIntegrity, fixtureOverrides, writeAuditIntegrity } from "./style-audit-integrity.mjs"
const root = fileURLToPath(new URL("../", import.meta.url))
const temporary = mkdtempSync(path.join(os.tmpdir(), "arkcn-audit-integrity-"))
try {
  const destination = path.join(temporary, "docs/.style-audit")
  mkdirSync(destination, { recursive: true })
  for (const directory of ["ui", "adapters", "examples"])
    cpSync(path.join(root, "docs/.style-audit", directory), path.join(destination, directory), { recursive: true })
  for (const file of [
    "reference.css",
    "tailwind.css",
    "nova.css",
    "adapt.tsx",
    "use-mobile.ts",
    "icon-placeholder.tsx",
    "integrity.json",
  ])
    cpSync(path.join(root, "docs/.style-audit", file), path.join(destination, file))
  mkdirSync(path.join(temporary, "docs/src"), { recursive: true })
  for (const file of ["audit-motion.ts", "audit-carousel-motion.ts"])
    cpSync(path.join(root, "docs/src", file), path.join(temporary, "docs/src", file))
  const currentCss = path.join(temporary, "docs/src/catalog-audit.css")
  cpSync(path.join(root, "docs/src/catalog-audit.css"), currentCss)
  checkAuditIntegrity(temporary)
  const button = path.join(destination, "ui/button.tsx")
  const original = readFileSync(button, "utf8")
  writeFileSync(button, original + "\n// accidental reference edit\n")
  assert.throws(() => checkAuditIntegrity(temporary), /Reference changed/)
  writeFileSync(button, original)
  const css = readFileSync(currentCss, "utf8")
  writeFileSync(currentCss, css + '\n@source "../.style-audit";\n')
  assert.throws(() => checkAuditIntegrity(temporary), /unexpected CSS/)
  writeFileSync(currentCss, css)
  writeFileSync(button, original + '\nexport { Button as Other } from "@/components/ui/button"\n')
  writeAuditIntegrity(destination, "test")
  assert.throws(() => checkAuditIntegrity(temporary), /Unexpected reference import/)
  const overrides = fixtureOverrides(
    '<div className="[&_button]:p-0"><Button className="p-0" style={{color:"red"}} {...props} /></div>',
    "test.tsx"
  )
  assert.equal(overrides.length, 4)
  assert.equal(overrides[0].kind, "wrapper")
  assert.equal(overrides[3].kind, "component")
  console.log(
    "style-audit integrity tests: reference edits, CSS scan leakage, indirect imports, and override disclosure pass"
  )
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
