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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const random = mulberry32(2026)

export const overviewData = months.map((name) => ({
  name,
  total: Math.floor(random() * 5000) + 1000,
}))

export const analyticsData = days.map((name) => ({
  name,
  clicks: Math.floor(random() * 900) + 100,
  uniques: Math.floor(random() * 700) + 80,
}))

export const recentSales = [
  { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00", initials: "OM" },
  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00", initials: "JL" },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00", initials: "IN" },
  { name: "William Kim", email: "will@email.com", amount: "+$99.00", initials: "WK" },
  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00", initials: "SD" },
]

export const referrers = [
  { name: "Direct", value: 512 },
  { name: "Product Hunt", value: 238 },
  { name: "Twitter", value: 174 },
  { name: "Blog", value: 104 },
]

export const devices = [
  { name: "Desktop", value: 74 },
  { name: "Mobile", value: 22 },
  { name: "Tablet", value: 4 },
]

export const dashboardTopNav: { title: string; href: string; active?: boolean; disabled?: boolean }[] = [
  { title: "Overview", href: "/", active: true },
  { title: "Contacts", href: "/contacts" },
  { title: "Projects", href: "/projects/board" },
  { title: "Settings", href: "/settings" },
]
