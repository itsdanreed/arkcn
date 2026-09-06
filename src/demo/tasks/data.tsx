import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CircleIcon,
  CircleOffIcon,
  HelpCircleIcon,
  TimerIcon,
} from "lucide-react"

export type Task = {
  id: string
  title: string
  status: string
  label: string
  priority: string
}

export const labels = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
]

export const statuses = [
  { label: "Backlog", value: "backlog", icon: HelpCircleIcon },
  { label: "Todo", value: "todo", icon: CircleIcon },
  { label: "In Progress", value: "in progress", icon: TimerIcon },
  { label: "Done", value: "done", icon: CheckCircleIcon },
  { label: "Canceled", value: "canceled", icon: CircleOffIcon },
]

export const priorities = [
  { label: "Low", value: "low", icon: ArrowDownIcon },
  { label: "Medium", value: "medium", icon: ArrowRightIcon },
  { label: "High", value: "high", icon: ArrowUpIcon },
  { label: "Critical", value: "critical", icon: AlertCircleIcon },
]

// Deterministic pseudo-random generator so the demo data is stable.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const words =
  "auctus bardus minus pariatur vobis solitudo tamquam admoneo vehemens suscipit toties desidero tollo allatus blanditiis caute delibero deputo veritas vinculum expedita casus supplanto corona deserunt calamitas considero soleo coma tenuis vester ducimus aequus minima possimus vilis cuppedia celo alter depereo carus uberrime crapula damnatio tristis correptius adhaero itaque defendo".split(
    " "
  )

export function generateTasks(count = 100, seed = 12345): Task[] {
  const random = mulberry32(seed)
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)]
  const used = new Set<string>()
  return Array.from({ length: count }, () => {
    let id: string
    do {
      id = `TASK-${1000 + Math.floor(random() * 9000)}`
    } while (used.has(id))
    used.add(id)
    const length = 5 + Math.floor(random() * 10)
    const sentence = Array.from({ length }, () => pick(words)).join(" ")
    return {
      id,
      title: sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".",
      status: pick(["todo", "in progress", "done", "canceled", "backlog"]),
      label: pick(["bug", "feature", "documentation"]),
      priority: pick(["low", "medium", "high"]),
    }
  })
}
