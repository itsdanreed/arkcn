export type TicketStatus = "open" | "pending" | "solved" | "closed"
export type TicketPriority = "low" | "normal" | "high" | "urgent"

export type Person = { id: string; name: string; email: string; initials: string; avatar?: string }

export type TicketMessage = {
  id: string
  author: Person
  kind: "customer" | "agent" | "note"
  body: string
  at: Date
}

export type Ticket = {
  id: number
  subject: string
  status: TicketStatus
  priority: TicketPriority
  requester: Person
  assignee: Person | null
  tags: string[]
  channel: "email" | "chat" | "form"
  createdAt: Date
  updatedAt: Date
  dueAt: Date
  unread: boolean
  messages: TicketMessage[]
}

export const me: Person = {
  id: "me",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  initials: "AM",
}

export const agents: Person[] = [
  me,
  { id: "olivia", name: "Olivia Martin", email: "olivia@company.io", initials: "OM" },
  { id: "jackson", name: "Jackson Lee", email: "jackson@company.io", initials: "JL" },
]

const customers: Person[] = [
  { id: "ava", name: "Ava Patel", email: "ava@acme.com", initials: "AP" },
  { id: "liam", name: "Liam Chen", email: "liam@globex.io", initials: "LC" },
  { id: "noah", name: "Noah Garcia", email: "noah@initech.com", initials: "NG" },
  { id: "emma", name: "Emma Kim", email: "emma@hooli.xyz", initials: "EK" },
  { id: "mia", name: "Mia Turner", email: "mia@umbrella.co", initials: "MT" },
  { id: "ethan", name: "Ethan Brooks", email: "ethan@stark.com", initials: "EB" },
]

export const statuses: { value: TicketStatus; label: string; dot: string }[] = [
  { value: "open", label: "Open", dot: "bg-emerald-500" },
  { value: "pending", label: "Pending", dot: "bg-amber-500" },
  { value: "solved", label: "Solved", dot: "bg-sky-500" },
  { value: "closed", label: "Closed", dot: "bg-muted-foreground/50" },
]

export const priorities: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const h = 3_600_000
const now = Date.now()

type Seed = {
  subject: string
  status: TicketStatus
  priority: TicketPriority
  requester: number
  assignee: number | null
  tags: string[]
  channel: Ticket["channel"]
  ageH: number
  unread?: boolean
  thread: [kind: TicketMessage["kind"], body: string][]
}

const seeds: Seed[] = [
  {
    subject: "Can't export the monthly report as PDF",
    status: "open",
    priority: "high",
    requester: 0,
    assignee: 0,
    tags: ["reports", "bug"],
    channel: "email",
    ageH: 3,
    unread: true,
    thread: [
      [
        "customer",
        "When I click Export → PDF on the monthly report, the spinner runs for a minute and then nothing happens. CSV export works fine. This started yesterday.",
      ],
      ["note", "Reproduced on staging with reports over ~2k rows. Looks like the PDF worker times out at 60s."],
      [
        "agent",
        "Thanks Ava, I can reproduce this. Our PDF worker is timing out on larger reports. I've raised it with engineering and will update you today.",
      ],
      ["customer", "Great, thank you. We need it for the board meeting on Thursday if at all possible."],
    ],
  },
  {
    subject: "Invoice shows the old company address",
    status: "pending",
    priority: "normal",
    requester: 1,
    assignee: 0,
    tags: ["billing"],
    channel: "email",
    ageH: 26,
    thread: [
      [
        "customer",
        "We updated our address in Settings last month but the September invoice still shows the old one. Can you reissue it?",
      ],
      [
        "agent",
        "Hi Liam, I've reissued the invoice with the new address and sent it to billing@globex.io. Could you confirm it arrived?",
      ],
    ],
  },
  {
    subject: "SSO login loops back to the sign-in page",
    status: "open",
    priority: "urgent",
    requester: 2,
    assignee: null,
    tags: ["auth", "sso"],
    channel: "chat",
    ageH: 1,
    unread: true,
    thread: [
      [
        "customer",
        "Since this morning none of our team can sign in with Okta. It redirects back to the login page every time. About 40 people are affected.",
      ],
    ],
  },
  {
    subject: "How do I add a second admin?",
    status: "solved",
    priority: "low",
    requester: 3,
    assignee: 1,
    tags: ["how-to"],
    channel: "form",
    ageH: 50,
    thread: [
      ["customer", "Is there a way to have two admins on the account? I'd like my colleague to manage billing too."],
      [
        "agent",
        "Yes! Go to Settings → Team, click the member, and change their role to Admin. Let me know if you'd like me to do it for you.",
      ],
      ["customer", "Found it, thanks!"],
    ],
  },
  {
    subject: "Feature request: dark mode for the mobile app",
    status: "open",
    priority: "low",
    requester: 4,
    assignee: null,
    tags: ["feature-request", "mobile"],
    channel: "form",
    ageH: 72,
    thread: [["customer", "The web app has dark mode but the iOS app doesn't. Any plans?"]],
  },
  {
    subject: "Webhook deliveries failing with 502",
    status: "open",
    priority: "high",
    requester: 5,
    assignee: 2,
    tags: ["api", "webhooks"],
    channel: "email",
    ageH: 6,
    unread: true,
    thread: [
      [
        "customer",
        "Our endpoint has been receiving 502s from your webhook sender since 09:40 UTC. Our side is healthy. Are you seeing issues?",
      ],
      ["note", "Status page shows degraded webhook delivery in eu-west. Waiting on infra."],
    ],
  },
  {
    subject: "Charged twice for the same seat",
    status: "pending",
    priority: "high",
    requester: 0,
    assignee: 1,
    tags: ["billing"],
    channel: "email",
    ageH: 30,
    thread: [
      ["customer", "We see two charges of $49 for the seat added on Sept 2. Please refund one."],
      [
        "agent",
        "Sorry about that, Ava. I've issued the refund; it takes 3–5 business days to appear. I'll keep this open until you confirm.",
      ],
    ],
  },
  {
    subject: "Data import stuck at 87%",
    status: "open",
    priority: "normal",
    requester: 1,
    assignee: 0,
    tags: ["import"],
    channel: "chat",
    ageH: 12,
    thread: [
      ["customer", "The CSV import I started this morning has been at 87% for hours."],
      ["agent", "Looking into it now. Could you share the import ID from the top of the page?"],
      ["customer", "It's IMP-20931."],
    ],
  },
  {
    subject: "Cancel subscription at end of term",
    status: "solved",
    priority: "normal",
    requester: 2,
    assignee: 2,
    tags: ["billing", "churn"],
    channel: "email",
    ageH: 96,
    thread: [
      ["customer", "Please cancel our subscription at the end of the current term. We're consolidating tools."],
      [
        "agent",
        "Done. Your access continues until Oct 31. Sorry to see you go, and thanks for the feedback about consolidation.",
      ],
    ],
  },
  {
    subject: "API rate limit lower than documented",
    status: "closed",
    priority: "normal",
    requester: 3,
    assignee: 1,
    tags: ["api"],
    channel: "email",
    ageH: 200,
    thread: [
      ["customer", "Docs say 600 req/min but we get throttled at around 300."],
      [
        "agent",
        "The docs were out of date. 300/min is correct for the Team plan; I've fixed the docs and added a note about the Business plan limits.",
      ],
      ["customer", "Understood, thanks."],
    ],
  },
  {
    subject: "Sharing link opens a blank page",
    status: "open",
    priority: "normal",
    requester: 4,
    assignee: null,
    tags: ["bug", "sharing"],
    channel: "form",
    ageH: 20,
    thread: [["customer", "Public sharing links open a blank page in Safari. Chrome works."]],
  },
  {
    subject: "Request for SOC 2 report",
    status: "pending",
    priority: "low",
    requester: 5,
    assignee: 2,
    tags: ["security", "compliance"],
    channel: "email",
    ageH: 45,
    thread: [
      ["customer", "Our security team needs your latest SOC 2 Type II report and pen test summary."],
      [
        "agent",
        "Hi Ethan, I've sent the NDA for signature. Once it's back I'll share both documents through the trust portal.",
      ],
    ],
  },
]

export const tickets: Ticket[] = seeds.map((s, i) => {
  const createdAt = new Date(now - s.ageH * h)
  const messages = s.thread.map((entry, j) => ({
    id: `${i}-${j}`,
    author: entry[0] === "customer" ? customers[s.requester] : s.assignee !== null ? agents[s.assignee] : me,
    kind: entry[0],
    body: entry[1],
    at: new Date(createdAt.getTime() + j * Math.max(1, Math.floor(s.ageH / (s.thread.length + 1))) * h),
  }))
  return {
    id: 4820 + i,
    subject: s.subject,
    status: s.status,
    priority: s.priority,
    requester: customers[s.requester],
    assignee: s.assignee === null ? null : agents[s.assignee],
    tags: s.tags,
    channel: s.channel,
    createdAt,
    updatedAt: messages[messages.length - 1].at,
    dueAt: new Date(createdAt.getTime() + (s.priority === "urgent" ? 4 : s.priority === "high" ? 8 : 24) * h),
    unread: !!s.unread,
    messages,
  }
})
