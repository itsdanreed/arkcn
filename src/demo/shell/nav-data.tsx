import {
  ActivityIcon,
  AudioWaveformIcon,
  BellIcon,
  BugIcon,
  CalendarDaysIcon,
  CommandIcon,
  ConstructionIcon,
  FileXIcon,
  FolderKanbanIcon,
  GalleryVerticalEndIcon,
  GanttChartIcon,
  Grid3x3Icon,
  HelpCircleIcon,
  ImportIcon,
  KanbanIcon,
  LayoutTemplateIcon,
  LayoutDashboardIcon,
  ListFilterIcon,
  ListTodoIcon,
  ListTreeIcon,
  Rows3Icon,
  LockIcon,
  MessagesSquareIcon,
  MonitorIcon,
  PackageIcon,
  PaletteIcon,
  PenLineIcon,
  ServerOffIcon,
  SettingsIcon,
  TicketIcon,
  ShieldCheckIcon,
  UserCogIcon,
  UsersIcon,
  UserXIcon,
  WorkflowIcon,
  WrenchIcon,
} from "lucide-react"

export type NavItemBase = { title: string; badge?: string; icon?: React.ElementType }
export type NavLink = NavItemBase & { url: string; items?: never }
export type NavCollapsible = NavItemBase & { items: (NavItemBase & { url: string })[]; url?: never }
export type NavItem = NavLink | NavCollapsible
export type NavGroup = { title: string; items: NavItem[] }

export const user = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: undefined as string | undefined,
  initials: "AM",
}

export const teams = [
  { name: "UI Toolkit", logo: CommandIcon, plan: "Vite + Ark UI" },
  { name: "Acme Inc", logo: GalleryVerticalEndIcon, plan: "Enterprise" },
  { name: "Acme Corp.", logo: AudioWaveformIcon, plan: "Startup" },
]

export const navGroups: NavGroup[] = [
  {
    title: "Home",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboardIcon }],
  },
  {
    title: "Work",
    items: [
      {
        title: "Projects",
        icon: FolderKanbanIcon,
        items: [
          { title: "Tasks", url: "/projects/tasks", icon: ListTodoIcon },
          { title: "Board", url: "/projects/board", icon: KanbanIcon },
          { title: "Timeline", url: "/projects/timeline", icon: GanttChartIcon },
          { title: "Calendar", url: "/projects/calendar", icon: CalendarDaysIcon },
        ],
      },
      { title: "Documents", url: "/documents", icon: PenLineIcon },
      { title: "Forms", url: "/forms", icon: LayoutTemplateIcon },
      { title: "Automations", url: "/automations", icon: WorkflowIcon },
    ],
  },
  {
    title: "Customers",
    items: [
      { title: "Contacts", url: "/contacts", icon: Grid3x3Icon },
      { title: "Segments", url: "/segments", icon: ListFilterIcon },
      { title: "Inbox", url: "/inbox", badge: "3", icon: MessagesSquareIcon },
      { title: "Tickets", url: "/tickets", icon: TicketIcon },
      { title: "Activity", url: "/activity", icon: ActivityIcon },
    ],
  },
  {
    title: "Data",
    items: [
      { title: "Import", url: "/import", icon: ImportIcon },
      { title: "Integrations", url: "/integrations", icon: PackageIcon },
      { title: "Audit log", url: "/audit-log", icon: Rows3Icon },
    ],
  },
  {
    title: "Organization",
    items: [
      { title: "Members", url: "/members", icon: UsersIcon },
      { title: "Roles & access", url: "/access", icon: ListTreeIcon },
      {
        title: "Settings",
        icon: SettingsIcon,
        items: [
          { title: "Profile", url: "/settings", icon: UserCogIcon },
          { title: "Account", url: "/settings/account", icon: WrenchIcon },
          { title: "Appearance", url: "/settings/appearance", icon: PaletteIcon },
          { title: "Notifications", url: "/settings/notifications", icon: BellIcon },
          { title: "Display", url: "/settings/display", icon: MonitorIcon },
        ],
      },
    ],
  },
  {
    title: "Other",
    items: [
      { title: "Help Center", url: "/help-center", icon: HelpCircleIcon },
      {
        title: "Auth pages",
        icon: ShieldCheckIcon,
        items: [
          { title: "Sign In", url: "/sign-in" },
          { title: "Sign Up", url: "/sign-up" },
          { title: "Forgot Password", url: "/forgot-password" },
        ],
      },
      {
        title: "Error pages",
        icon: BugIcon,
        items: [
          { title: "Unauthorized", url: "/errors/unauthorized", icon: LockIcon },
          { title: "Forbidden", url: "/errors/forbidden", icon: UserXIcon },
          { title: "Not Found", url: "/errors/not-found", icon: FileXIcon },
          { title: "Internal Server Error", url: "/errors/internal-server-error", icon: ServerOffIcon },
          { title: "Maintenance Error", url: "/errors/maintenance-error", icon: ConstructionIcon },
        ],
      },
    ],
  },
]
