// Preserve web OKLCH colors while deriving both renderers from one token source.
import { readFileSync, writeFileSync } from "node:fs"
import { cssColor, designTokens, palettes } from "../packages/core/src/tokens.ts"

const path = new URL("../packages/react/src/styles/arkcn.css", import.meta.url)
let css = readFileSync(path, "utf8")
for (const [mode, selector] of [
  ["light", ":root"],
  ["dark", ".dark"],
]) {
  const lines = Object.entries(palettes[mode]).map(([name, color]) => `  --${name}: ${cssColor(color)};`)
  if (mode === "light") {
    lines.push(`  --default-transition-duration: ${designTokens.motion.duration}ms;`)
    lines.push(`  --default-transition-timing-function: cubic-bezier(${designTokens.motion.easing.join(", ")});`)
    lines.push(`  --animate-spin: spin ${designTokens.motion.spinDuration}ms linear infinite;`)
    lines.push(
      `  --animate-pulse: pulse ${designTokens.motion.pulseDuration}ms cubic-bezier(${designTokens.motion.pulseEasing.join(", ")}) infinite;`
    )
    lines.push(`  --radius: ${designTokens.radius.lg / 16}rem;`)
    for (const [name, value] of Object.entries(designTokens.controlHeight))
      lines.push(`  --arkcn-control-${name}: ${value / 16}rem;`)
    lines.push(`  --arkcn-control-x: ${designTokens.spacing.controlX / 16}rem;`)
  }
  const pattern = new RegExp(`${selector.replace(".", "\\.")} \\{\\n[\\s\\S]*?\\n\\}`)
  if (!pattern.test(css)) throw new Error(`Missing ${selector} token block`)
  css = css.replace(pattern, `${selector} {\n${lines.join("\n")}\n}`)
}
writeFileSync(path, css)
console.log("build-tokens: shared OKLCH palettes and control metrics -> web CSS")
