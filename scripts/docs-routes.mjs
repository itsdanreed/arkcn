// After `vite build` of the docs: copy index.html into every route folder so deep links work
// on any static host (no SPA fallback needed). Routes: /, /docs, guides, /docs/components/<name>.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const dist = join(root, "docs/dist")
const index = JSON.parse(readFileSync(join(root, "registry/index.json"), "utf8"))
const nav = readFileSync(join(root, "docs/src/nav.ts"), "utf8")
const guidePaths = [...nav.matchAll(/path: "([^"]+)"/g)].map((m) => m[1])
const routes = [
  ...guidePaths,
  "/docs/components",
  ...index.items.filter((i) => i.type === "ui").map((i) => `/docs/components/${i.name}`),
]
for (const route of routes) {
  const dir = join(dist, route)
  mkdirSync(dir, { recursive: true })
  copyFileSync(join(dist, "index.html"), join(dir, "index.html"))
}
console.log(`docs-routes: ${routes.length} routes`)
