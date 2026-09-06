import { CreditCardIcon, ShieldIcon, UserCheckIcon, UsersIcon } from "lucide-react"

export type UserStatus = "active" | "inactive" | "invited" | "suspended"
export type UserRole = "superadmin" | "admin" | "cashier" | "manager"

export type User = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: UserStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export const statusStyles: Record<UserStatus, string> = {
  active: "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
  inactive: "bg-neutral-300/40 border-neutral-300",
  invited: "bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300",
  suspended: "bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10",
}

export const statuses = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
] as const

export const roles = [
  { label: "Superadmin", value: "superadmin", icon: ShieldIcon },
  { label: "Admin", value: "admin", icon: UserCheckIcon },
  { label: "Manager", value: "manager", icon: UsersIcon },
  { label: "Cashier", value: "cashier", icon: CreditCardIcon },
] as const

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

const firstNames =
  "Alex Taylor Jordan Morgan Casey Riley Avery Quinn Harper Rowan Emerson Finley Sawyer Parker Reese Dakota Skyler Hayden Kendall Blake Cameron Devon Elliot Jamie Kai Logan Micah Noel Peyton Sage".split(
    " "
  )
const lastNames =
  "Anderson Bennett Carter Diaz Evans Foster Garcia Hughes Iverson Jenkins Kim Lopez Murphy Nguyen Owens Patel Quinn Reyes Sullivan Turner Underwood Vargas Walker Xu Young Zimmerman Brooks Chen Dawson Ellis".split(
    " "
  )
const domains = ["example.com", "gmail.com", "outlook.com", "company.io", "mail.dev"]

export function generateUsers(count = 500, seed = 67890): User[] {
  const random = mulberry32(seed)
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(random() * 10)).join("")
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(random() * 16).toString(16)).join("")
  const now = Date.now()
  const used = new Set<string>()
  return Array.from({ length: count }, () => {
    const firstName = pick(firstNames)
    const lastName = pick(lastNames)
    let username = `${firstName}${pick(["_", ".", ""])}${lastName}`.toLowerCase()
    if (used.has(username)) username += digits(2)
    used.add(username)
    return {
      id: `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`,
      firstName,
      lastName,
      username,
      email: `${firstName.toLowerCase()}${pick(["", ".", "_"])}${digits(random() < 0.5 ? 0 : 2)}@${pick(domains)}`,
      phoneNumber: `+${1 + Math.floor(random() * 90)} ${digits(3)} ${digits(3)} ${digits(4)}`,
      status: pick(statuses).value,
      role: pick(roles).value,
      createdAt: new Date(now - Math.floor(random() * 365) * 86_400_000),
      updatedAt: new Date(now - Math.floor(random() * 10) * 86_400_000),
    }
  })
}
