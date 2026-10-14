import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"

const app = fileURLToPath(new URL("..", import.meta.url))
const root = fileURLToPath(new URL("../../..", import.meta.url))
const names = [
  "button",
  "card",
  "input",
  "textarea",
  "badge",
  "separator",
  "spinner",
  "skeleton",
  "checkbox",
  "switch",
  "radio-group",
  "tabs",
  "collapsible",
  "progress",
  "alert",
  "avatar",
  "toggle",
  "toggle-group",
  "accordion",
  "input-group",
  "button-group",
  "label",
  "aspect-ratio",
]
const cli = join(root, "packages/cli/bin/arkcn.mjs")
execFileSync(process.execPath, [cli, "init", "--cwd", app, "--framework", "react-native", "--yes", "--no-install"], {
  stdio: "inherit",
})
execFileSync(process.execPath, [cli, "add", ...names, "--cwd", app, "--yes", "--overwrite", "--no-install"], {
  stdio: "inherit",
})
mkdirSync(join(app, "src/demos"), { recursive: true })
for (const name of names) {
  const source = readFileSync(join(root, "docs/src/native-examples", `${name}.tsx`), "utf8")
    .replaceAll("@multicomma/arkcn-react-native/ui/", "@/components/ui/")
    .replaceAll("@multicomma/arkcn-react-native/lib/", "@/lib/")
  writeFileSync(join(app, "src/demos", `${name}.tsx`), source)
}
writeFileSync(
  join(app, "src/demos/index.ts"),
  names.map((name, i) => `import Demo${i} from "./${name}"`).join("\n") +
    "\nexport const demos = [\n" +
    names.map((name, i) => `  { name: "${name}", Component: Demo${i} },`).join("\n") +
    "]\n"
)
