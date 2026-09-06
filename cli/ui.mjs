import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"

const tty = stdout.isTTY && !process.env.NO_COLOR
const ESC = "["
const paint = (code) => (s) => (tty ? `${ESC}${code}m${s}${ESC}0m` : String(s))
export const c = {
  bold: paint("1"),
  dim: paint("2"),
  green: paint("32"),
  yellow: paint("33"),
  red: paint("31"),
  cyan: paint("36"),
}

export const log = (...args) => console.log(...args)
export const ok = (msg) => log(`${c.green("+")} ${msg}`)
export const warn = (msg) => log(`${c.yellow("!")} ${msg}`)
export const fail = (msg) => {
  console.error(`${c.red("x")} ${msg}`)
  process.exit(1)
}

export async function confirm(question, { yes = false, fallback = true } = {}) {
  if (yes) return fallback
  if (!stdin.isTTY) return fallback
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const answer = (await rl.question(`${question} ${fallback ? "[Y/n]" : "[y/N]"} `)).trim().toLowerCase()
    if (!answer) return fallback
    return answer === "y" || answer === "yes"
  } finally {
    rl.close()
  }
}

export function table(rows, headers) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length)))
  const line = (cells) =>
    cells
      .map((cell, i) => String(cell ?? "").padEnd(widths[i]))
      .join("  ")
      .trimEnd()
  log(c.bold(line(headers)))
  for (const r of rows) log(line(r))
}
