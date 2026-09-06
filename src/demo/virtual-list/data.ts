// Deterministic seeded data so the demo and its tests are stable.
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

export type LogLine = { id: number; level: "info" | "warn" | "error" | "debug"; time: string; message: string }

const levels: LogLine["level"][] = ["info", "info", "info", "debug", "debug", "warn", "error"]
const services = ["api", "worker", "scheduler", "auth", "billing", "mailer", "search"]
const verbs = ["handled", "queued", "retried", "completed", "rejected", "cached", "flushed"]
const objects = ["request", "job", "webhook", "invoice", "session", "index", "batch"]

export const LOG_COUNT = 100_000

const random = rng(42)
const logCache = new Map<number, LogLine>()
export function logLine(index: number): LogLine {
  const cached = logCache.get(index)
  if (cached) return cached
  const r = rng(index * 7919 + 17)
  const level = levels[Math.floor(r() * levels.length)]
  const svc = services[Math.floor(r() * services.length)]
  const verb = verbs[Math.floor(r() * verbs.length)]
  const obj = objects[Math.floor(r() * objects.length)]
  const ms = Math.floor(r() * 900) + 3
  let message = `${svc}: ${verb} ${obj} #${1000 + Math.floor(r() * 9000)} in ${ms}ms`
  if (level === "error") {
    message += `\n  at ${svc}/handler.ts:${Math.floor(r() * 400)}\n  at runtime/loop.ts:${Math.floor(r() * 90)}`
  } else if (level === "warn" && r() > 0.5) {
    message += `\n  retrying in ${Math.floor(r() * 30) + 1}s`
  }
  const t = new Date(Date.UTC(2026, 8, 6, 9, 0, 0) + index * 137)
  const line: LogLine = { id: index + 1, level, time: t.toISOString().slice(11, 23), message }
  logCache.set(index, line)
  return line
}
void random

export type Contact = { id: string; name: string; email: string; team: string }

const first = ["Ava", "Noah", "Mia", "Liam", "Zoe", "Ella", "Omar", "Jack", "Ivy", "Sam", "Leo", "Nora", "Eli", "Ruby"]
const last = [
  "Chen",
  "Patel",
  "Torres",
  "Brooks",
  "Kim",
  "Novak",
  "Haddad",
  "Rivera",
  "Laurent",
  "Okafor",
  "Sato",
  "Weber",
]
const teams = ["Platform", "Web", "Design", "Sales", "Support", "Finance"]

export const contacts: Contact[] = (() => {
  const r = rng(7)
  return Array.from({ length: 10_000 }, (_, i) => {
    const f = first[Math.floor(r() * first.length)]
    const l = last[Math.floor(r() * last.length)]
    return {
      id: `c-${i + 1}`,
      name: `${f} ${l}`,
      email: `${f}.${l}${i + 1}@example.com`.toLowerCase(),
      team: teams[Math.floor(r() * teams.length)],
    }
  })
})()
