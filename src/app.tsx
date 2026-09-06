import * as React from "react"
import { ThemeProvider } from "next-themes"
import { DownloadIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppsPage } from "@/demo/apps/apps-page"
import { ChatPage } from "@/demo/chat/chat-page"
import { DashboardPage } from "@/demo/dashboard/dashboard-page"
import { DashboardTopNav } from "@/demo/dashboard/top-nav"
import { ForgotPasswordPage } from "@/demo/auth/forgot-password-page"
import {
  ForbiddenPage,
  InternalServerErrorPage,
  MaintenancePage,
  NotFoundPage,
  UnauthorizedPage,
} from "@/demo/errors/error-pages"
import { SignInPage } from "@/demo/auth/sign-in-page"
import { SignUpPage } from "@/demo/auth/sign-up-page"
import { PickersPage } from "@/demo/pickers/pickers-page"
import { VirtualListPage } from "@/demo/virtual-list/virtual-list-page"
import { FormBuilderPage } from "@/demo/form-builder/form-builder-page"
import { ImportPage } from "@/demo/import/import-page"
import { KanbanPage } from "@/demo/kanban/kanban-page"
import { NodeGraphPage } from "@/demo/node-graph/node-graph-page"
import { QueryBuilderPage } from "@/demo/query-builder/query-builder-page"
import { DataGridPage } from "@/demo/data-grid/data-grid-page"
import { RichTextPage } from "@/demo/rich-text/rich-text-page"
import { GanttPage } from "@/demo/gantt/gantt-page"
import { ActivityPage } from "@/demo/activity/activity-page"
import { CalendarPage } from "@/demo/calendar/calendar-page"
import { TicketsPage } from "@/demo/tickets/tickets-page"
import { AppShellDemo } from "@/demo/shell/app-shell-demo"
import { SettingsPage } from "@/demo/settings/settings-page"
import { useHashRoute } from "@/demo/shell/router"
import { generateTasks } from "@/demo/tasks/data"
import { TasksDialogs } from "@/demo/tasks/dialogs"
import { TasksProvider, useTasks } from "@/demo/tasks/tasks-provider"
import { TasksTable } from "@/demo/tasks/tasks-table"
import { UsersPage } from "@/demo/users/users-page"

const tasks = generateTasks(100)

function PrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpen("import")}>
        Import <DownloadIcon />
      </Button>
      <Button onClick={() => setOpen("create")}>
        Create <PlusIcon />
      </Button>
    </div>
  )
}

function TasksPage() {
  return (
    <TasksProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
          </div>
          <PrimaryButtons />
        </div>
        <TasksTable data={tasks} />
      </div>
      <TasksDialogs />
    </TasksProvider>
  )
}

function Placeholder({ path }: { path: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold tracking-tight">{path === "/" ? "Dashboard" : path}</h2>
      <p className="text-muted-foreground">This route is a placeholder in the demo.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="mt-4 h-96 rounded-xl border bg-card" />
    </div>
  )
}

/** Old component-named routes keep working. */
const legacyRoutes: Record<string, string> = {
  "/tasks": "/projects/tasks",
  "/kanban": "/projects/board",
  "/gantt": "/projects/timeline",
  "/calendar": "/projects/calendar",
  "/rich-text": "/documents",
  "/form-builder": "/forms",
  "/node-graph": "/automations",
  "/data-grid": "/contacts",
  "/query-builder": "/segments",
  "/chats": "/inbox",
  "/apps": "/integrations",
  "/virtual-list": "/audit-log",
  "/users": "/members",
  "/pickers": "/access",
}

const fixedRoutes = new Set([
  "/inbox",
  "/integrations",
  "/projects/board",
  "/projects/calendar",
  "/projects/timeline",
  "/contacts",
  "/automations",
  "/forms",
  "/tickets",
])

const knownPrefixes = ["/import", "/settings"]
const knownExact = new Set([
  "/",
  "/projects/tasks",
  "/projects/board",
  "/projects/timeline",
  "/projects/calendar",
  "/documents",
  "/forms",
  "/automations",
  "/contacts",
  "/segments",
  "/inbox",
  "/tickets",
  "/activity",
  "/integrations",
  "/audit-log",
  "/members",
  "/access",
  "/help-center",
])
const knownRoute = (path: string) => knownExact.has(path) || knownPrefixes.some((p) => path.startsWith(p))

function Routes() {
  const { path, navigate } = useHashRoute()
  const redirect = legacyRoutes[path]
  React.useEffect(() => {
    if (redirect) navigate(redirect)
  }, [redirect, navigate])
  const fixed = fixedRoutes.has(path) || path.startsWith("/settings")
  if (path === "/sign-in") return <SignInPage navigate={navigate} />
  if (path === "/sign-up") return <SignUpPage navigate={navigate} />
  if (path === "/forgot-password") return <ForgotPasswordPage />
  if (path === "/errors/unauthorized") return <UnauthorizedPage navigate={navigate} />
  if (path === "/errors/forbidden") return <ForbiddenPage navigate={navigate} />
  if (path === "/errors/not-found") return <NotFoundPage navigate={navigate} />
  if (path === "/errors/internal-server-error") return <InternalServerErrorPage navigate={navigate} />
  if (path === "/errors/maintenance-error") return <MaintenancePage navigate={navigate} />
  if (!redirect && !knownRoute(path)) return <NotFoundPage navigate={navigate} path={path} />
  return (
    <AppShellDemo fixed={fixed} headerStart={path === "/" ? <DashboardTopNav /> : undefined}>
      {path === "/" ? (
        <DashboardPage />
      ) : path === "/projects/tasks" ? (
        <TasksPage />
      ) : path === "/inbox" ? (
        <ChatPage />
      ) : path === "/integrations" ? (
        <AppsPage />
      ) : path === "/projects/board" ? (
        <KanbanPage />
      ) : path === "/automations" ? (
        <NodeGraphPage />
      ) : path === "/segments" ? (
        <QueryBuilderPage />
      ) : path === "/contacts" ? (
        <DataGridPage />
      ) : path === "/documents" ? (
        <RichTextPage />
      ) : path === "/projects/timeline" ? (
        <GanttPage />
      ) : path === "/activity" ? (
        <ActivityPage />
      ) : path === "/projects/calendar" ? (
        <CalendarPage />
      ) : path === "/audit-log" ? (
        <VirtualListPage />
      ) : path === "/access" ? (
        <PickersPage />
      ) : path === "/forms" ? (
        <FormBuilderPage />
      ) : path === "/tickets" ? (
        <TicketsPage />
      ) : path.startsWith("/import") ? (
        <ImportPage path={path} navigate={navigate} />
      ) : path === "/members" ? (
        <UsersPage />
      ) : path.startsWith("/settings") ? (
        <SettingsPage path={path} navigate={navigate} />
      ) : (
        <Placeholder path={path} />
      )}
    </AppShellDemo>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Routes />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
