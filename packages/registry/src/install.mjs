import { targetPath, rewriteImports, readProjectFile, writeProjectFile, installedVersion } from "./project.mjs"

/** Write an item's files. Returns what was written and what was kept. */
export function writeItem(cwd, config, item, { overwrite }) {
  const written = []
  const kept = []
  for (const file of item.files) {
    const rel = targetPath(config, file.path)
    const content = rewriteImports(file.content, config)
    const current = readProjectFile(cwd, rel)
    if (current === content) continue
    if (current !== null && !overwrite) {
      kept.push(rel)
      continue
    }
    writeProjectFile(cwd, rel, content)
    written.push(rel)
  }
  return { written, kept }
}

/** Files that exist locally and differ from the registry version. */
export function findConflicts(cwd, config, items) {
  const conflicts = []
  for (const item of items)
    for (const file of item.files) {
      const rel = targetPath(config, file.path)
      const current = readProjectFile(cwd, rel)
      if (current !== null && current !== rewriteImports(file.content, config)) conflicts.push(rel)
    }
  return conflicts
}

/** Packages an item set needs that the project does not have yet. */
export function missingDependencies(cwd, items) {
  const deps = new Map()
  for (const item of items)
    for (const [dep, version] of Object.entries(item.dependencies))
      if (!installedVersion(cwd, dep)) deps.set(dep, version)
  return [...deps].map(([dep, version]) => `${dep}@${version}`)
}
