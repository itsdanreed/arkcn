// End-to-end check of the CLI against a throwaway project: init, add, diff, overwrite.
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const bin = join(root, "bin/tideui.mjs")
const cwd = mkdtempSync(join(tmpdir(), "tideui-cli-"))
const run = (...args) =>
  execFileSync("node", [bin, ...args, "--cwd", cwd], { encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } })
const assert = (cond, msg) => {
  if (!cond) {
    console.error(`test-cli: FAIL ${msg}`)
    process.exit(1)
  }
}

try {
  writeFileSync(
    join(cwd, "package.json"),
    JSON.stringify({ name: "app", dependencies: { react: "^19", tailwindcss: "^4.0.0" } })
  )
  writeFileSync(join(cwd, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }))
  writeFileSync(join(cwd, "vite.config.ts"), "export default {}\n")

  const initOut = run("init", "--yes", "--no-install")
  assert(existsSync(join(cwd, "tide.json")), "init writes tide.json")
  assert(existsSync(join(cwd, "src/lib/utils.ts")), "init writes lib/utils.ts")
  const css = readFileSync(join(cwd, "src/index.css"), "utf8")
  assert(css.startsWith('@import "tailwindcss";'), "init creates the stylesheet with the tailwind import")
  assert(css.includes("@custom-variant data-selected"), "init merges the base styles")
  assert(
    JSON.parse(readFileSync(join(cwd, "tsconfig.json"), "utf8")).compilerOptions.paths["@/*"],
    "init adds the alias"
  )
  assert(/Needed:.*@ark-ui\/react/.test(initOut), "init lists base dependencies when not installing")
  assert(/Add the alias to vite.config.ts/.test(initOut), "init warns about the vite alias")

  const addOut = run("add", "data-grid", "rich-text-editor", "--no-install")
  for (const f of [
    "src/components/ui/data-grid.tsx",
    "src/components/ui/select.tsx",
    "src/components/ui/checkbox.tsx",
    "src/lib/data-table-adapter.ts",
    "src/lib/controllable.ts",
    "src/components/ui/live-region.tsx",
    "src/components/ui/rich-text-editor.tsx",
  ])
    assert(existsSync(join(cwd, f)), `add writes ${f}`)
  assert(/@tiptap\/react/.test(addOut), "add lists the editor's packages")
  const css2 = readFileSync(join(cwd, "src/index.css"), "utf8")
  assert(css2.includes("/* tide:component rich-text-editor */"), "add merges the component css fragment")
  assert(css2.split("tide:base */").length === 2, "base block appears once")

  // Every "@/..." import of a written file resolves to a written file.
  const written = execFileSync("find", [join(cwd, "src"), "-type", "f"], { encoding: "utf8" })
    .trim()
    .split("\n")
  for (const file of written) {
    const src = readFileSync(file, "utf8")
    for (const m of src.matchAll(/from "@\/([^"]+)"/g)) {
      const target = join(cwd, "src", m[1])
      assert(
        existsSync(target + ".ts") || existsSync(target + ".tsx"),
        `${file} imports @/${m[1]} which was not written`
      )
    }
  }

  // Re-adding is a no-op, local edits show in diff, --overwrite restores them.
  const again = run("add", "data-grid", "--no-install")
  assert(!/-> src\/components\/ui\/data-grid.tsx/.test(again), "re-add does not rewrite unchanged files")
  const gridFile = join(cwd, "src/components/ui/data-grid.tsx")
  writeFileSync(gridFile, readFileSync(gridFile, "utf8") + "\n// local change\n")
  assert(/changed src\/components\/ui\/data-grid.tsx/.test(run("diff", "data-grid")), "diff reports local edits")
  run("add", "data-grid", "--overwrite", "--no-install")
  assert(/same/.test(run("diff", "data-grid")), "add --overwrite restores the registry version")

  // Custom alias and directories are honoured.
  const cwd2 = mkdtempSync(join(tmpdir(), "tideui-cli2-"))
  writeFileSync(join(cwd2, "package.json"), JSON.stringify({ name: "app2", dependencies: { tailwindcss: "^4.0.0" } }))
  execFileSync("node", [bin, "init", "--yes", "--no-install", "--alias", "~", "--dir", "app", "--cwd", cwd2], {
    encoding: "utf8",
  })
  execFileSync("node", [bin, "add", "button", "--no-install", "--cwd", cwd2], { encoding: "utf8" })
  const button = readFileSync(join(cwd2, "app/components/ui/button.tsx"), "utf8")
  assert(button.includes('from "~/lib/utils"'), "add rewrites the alias and directories")
  rmSync(cwd2, { recursive: true, force: true })

  console.log("test-cli: ok")
} finally {
  rmSync(cwd, { recursive: true, force: true })
}
